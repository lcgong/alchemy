
import inspect
import re
import sys
from yarl import URL
from .handler import request_handler_factory
from inspect import getmodule
from importlib import  import_module
from pkgutil import walk_packages
import aiohttp

class DynamicResource(aiohttp.web_urldispatcher.Resource):

    def __init__(self, pattern, formatter, *, name=None):
        super().__init__(name=name)
        assert pattern.pattern.startswith('/')
        # assert pattern.pattern.startswith('\\/')
        assert formatter.startswith('/')
        self._pattern = pattern
        self._formatter = formatter


    def add_prefix(self, prefix):
        assert prefix.startswith('/')
        assert not prefix.endswith('/')
        assert len(prefix) > 1
        self._pattern = re.compile(re.escape(prefix)+self._pattern.pattern)
        self._formatter = prefix + self._formatter

    def _match(self, path):
        match = self._pattern.fullmatch(path)
        if match is None:
            return None
        else:
            return {key: URL.build(path=value, encoded=True).path
                    for key, value in match.groupdict().items()}

    def raw_match(self, path):
        return self._formatter == path

    def get_info(self):
        return {'formatter': self._formatter, 'pattern': self._pattern}

    def url_for(self, **parts):
        url = self._formatter.format_map({k: URL.build(path=v).raw_path
                                          for k, v in parts.items()})
        return URL.build(path=url)


    def __repr__(self):
        name = "'" + self.name + "' " if self.name is not None else ""
        return ("<DynamicResource {name} {formatter}>"
                .format(name=name, formatter=self._formatter))


class RouteSpec():

    def __init__(self, spec_no, path, methods, handler_func):
        self._spec_no = spec_no

        self.path = path
        self.methods = methods
        self.handler_func = handler_func

        self.path_fields = None
        self.query_fields = None
        self.post_fields = None


    def __repr__(self):
        return (f"<RouteSpec '{self.path}' "
                f"[{','.join(self.methods)}] '{self.handler_func.__name__}' "
                f"in '{self.handler_func.__module__}'>")


class RESTfulModules():

    def __init__(self, prefix):

        self._spec_max_no = 0

        self._handlers = {}

        self._module_prefix = prefix if prefix else {}
        self._module_paths = self._module_prefix
        
    def __getattr__(self, method):
        return RouteMethodDecorator(self)._add_method(method)

    def set_path(self, path):
        assert len(path) >= 1
        module = inspect.getmodule(sys._getframe(1))
        self._module_paths[module.__name__] = path

    def setup(self, app):
        for module_name in sorted(set(self._module_prefix.keys())):
            for module in _iter_submodules(module_name):
                app.logger.debug('dynamic loaded module: ' + module.__name__)

        specs = []
        for spec in self._handlers.values():
            specs += spec
        specs = sorted(specs, key=lambda s : s._spec_no) # 按出现顺序排序

        for spec in specs:
            resource  = DynamicResource(spec.path_pattern, spec.path_formatter)
            app.router.register_resource(resource)

            for method in spec.methods:
                handler = request_handler_factory(spec, method)
                route = resource.add_route(method, handler)
                setattr(route, '_route_spec', spec)     

        infos = []
        for resource in app.router._resources:
            for route in resource:
                method = route.method
                formatter = route._resource._formatter
                func = route._route_spec.handler_func.__qualname__
                module = route._route_spec.handler_func.__module__
                infos.append(f"{formatter} [{method}] => {func} in {module}")

        app.logger.info('Route Definition:\n' + '\n'.join(infos) + '\n')
                       
    def _inc_spec_no(self):
        self._spec_max_no += 1
        return self._spec_max_no


class RouteMethodDecorator():
    """ 
    
    """
    
    def __init__(self, routes):
        self.methods = []
        self._routes = routes

    def __call__(self, path, query_fields=None, post_fields=None):

        def decorator(handler):
            prefix = self._get_module_prefix(getmodule(handler).__name__)
            abspath = _pathjoin(prefix, path)
            abspath = URL._normalize_path(abspath) 

            spec_no = self._routes._inc_spec_no()
            spec = RouteSpec(spec_no, abspath, self.methods, handler)
            spec.query_fields = _parse_fields(query_fields)
            spec.post_fields = _parse_fields(post_fields)

            parse_path(spec, abspath)

            handlers = self._routes._handlers
            if handler not in handlers:
                handlers[handler] = [spec]
            else:
                handlers[handler].append(spec)

            return handler

        return decorator

    def __getattr__(self, method):
        return self._add_method(method)


    def _get_module_prefix(self, module_name):
        module_paths = self._routes._module_paths

        prefix = self._routes._module_paths.get(module_name)
        if prefix is not None and prefix.startswith('/'):
            return prefix

        parts = module_name.rsplit('.', maxsplit=1)
        if len(parts) == 1: # 顶层模块
            raise ValueError(f"The root module requires the prefix")

        parent = self._get_module_prefix(parts[0]) # 父级模块的前缀
        if prefix is None:
            # 模块没有设置路径，因此采用模块名作为本级目录
            prefix = _pathjoin(parent, parts[1])
            
        else:
            prefix = _pathjoin(parent, prefix)

        module_paths[module_name] = prefix

        return prefix

    def _add_method(self, method):
        method = method.upper()
        if method not in ['GET', 'POST', 'PUT', 'DELETE']:
            raise ValueError(f"Not support {method}")

        self.methods.append(method)
        return self


def _pathjoin(parent, part):
    assert not part.startswith('/')

    return parent + '/' + part



def _iter_submodules(root_module, recursive=True):
    """  """
    if isinstance(root_module, str):
        root_module = import_module(root_module)
    
    if not hasattr(root_module, '__path__'):
        yield root_module
        return

    if isinstance(root_module.__path__, list): # no namespace package
        yield root_module

    if not recursive:
        return

    prefix = root_module.__name__ + '.'

    for loader, module_name, ispkg in walk_packages(root_module.__path__, prefix):
        module = loader.find_module(module_name).load_module(module_name)
        if ispkg and not isinstance(module.__path__, list):
            continue

        yield module


_SPACE_COMMA_SEPERATOR_RE = re.compile(r'\s*[,]?\s*')
def _parse_fields(expr):
    if not expr:
        return []

    if expr and isinstance(expr, str):
        return list(m for m in _SPACE_COMMA_SEPERATOR_RE.split(expr))

    if isinstance(expr, Sequence):
        for m in expr:
            if not isinstance(m, str):
                raise ValueError(f"unkown type '{m.__class__.__name__}'")
        return expr

    raise ValueError(f"unknown type {expr} ")


_ROUTE_RE = re.compile(r'(\{[_a-zA-Z][^{}]*(?:\{[^{}]*\}[^{}]*)*\})')
_SOLID_PARAM_RE = re.compile(r'\{(?P<var>[_a-zA-Z][_a-zA-Z0-9]*)\}')
_TYPED_PARAM_RE = re.compile(r'\{(?P<var>[_a-zA-Z][_a-zA-Z0-9]*):(?P<type>\s*(?:int|float|str|path))\s*\}')
_REGEX_PARAM_RE = re.compile(r'\{(?P<var>[_a-zA-Z][_a-zA-Z0-9]*):(?P<re>.+)\}')

def parse_path(route_spec, pathexpr):

    pattern, signature = '', ''

    fields = []
    startpos = 0
    for param_part in _ROUTE_RE.finditer(pathexpr):
        part = param_part.group(0)

        param_name, param_regex = _parse_pathexpr_part(part)
        if param_name in fields:
            raise ValueError(f"duplicated '{{{param_name}}}' in '{pathexpr}'");

        fields.append(param_name)

        norm_part  = _escape_norm_part(pathexpr, startpos, param_part.start())
        
        pattern   += norm_part + f'(?P<{param_name}>{param_regex})'
        signature += norm_part + '{}'
        startpos = param_part.end()

    norm_part  = _escape_norm_part(pathexpr, startpos, None)
    pattern   += norm_part
    signature += norm_part

    try:
        pattern = re.compile(pattern)
    except re.error as exc:
        raise ValueError(
            "Bad pattern '{}': {}".format(pattern, exc)) from None

    route_spec.path_signature = signature
    route_spec.path_fields    = fields
    route_spec.path_pattern   = pattern
    route_spec.path_formatter = signature.format(*("{"+p+"}" for p in fields))


def _parse_pathexpr_part(part):
    match = _SOLID_PARAM_RE.fullmatch(part)
    if match:
        return match.group('var'), r'[^{}/]+'

    match = _TYPED_PARAM_RE.fullmatch(part)
    if match:
        param_type = match.group('type')
        if param_type == 'int':
            re_expr = r'[+-]?\d+'
        elif param_type == 'float':
            re_expr = r'[+-]?\d+(?:\.\d+(?:[eE][+-]?\d+)?)?'
        elif param_type == 'str':
            re_expr = r'[^{}/]+'
        elif param_type == 'path':
            re_expr = r'[^{}]+'
        else:
            raise ValueError(
                f"Unknown type '{param_type}' in path '{path}'['{part}']"
            )

        return match.group('var'), re_expr

    match = _REGEX_PARAM_RE.fullmatch(part)
    if match:
        return match.group('var'), match.group('re')

    return None, None

def _escape_norm_part(path, startpos, endpos):
    normal_part = path[startpos:endpos]

    if '{' in normal_part or '}' in normal_part:
        raise ValueError("Invalid path '{}'['{}']".format(path, normal_part))

    return URL(normal_part).raw_path
