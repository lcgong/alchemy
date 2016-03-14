# -*- coding: utf-8 -*-
import logging

import re
import sys
import bisect
import os.path
import inspect
import pkgutil
import importlib
import mimetypes

import tornado.web

from .static import StaticFileHandler, RaiseErrorHandler
from .cookie import generate_cookie_secret
from ..pillar import _pillar_history, pillar_class
from ..util import iter_submodules


class RouteError:
    pass


_request_handler = pillar_class(tornado.web.RequestHandler)(_pillar_history)



from collections import OrderedDict

class OrderedURLSpec(tornado.web.URLSpec):

    def __init__(self, priority, pattern, handler,
                    path=None, kwargs=None, name=None,
                    code_filename=None, code_lineno=None):

        self.priority = priority
        self.path = path
        self.code_filename = code_filename
        self.code_lineno = code_lineno

        super(OrderedURLSpec, self).__init__(pattern, handler, kwargs, name)

    def __lt__(self, other):
        if self.priority < other.priority:
            return True

        if self.priority == other.priority:
            if self.code_filename is not None and self.code_lineno is not None:
                if ((self.code_filename, self.code_lineno) <
                            (other.code_filename, other.code_lineno)):
                    return True

            if self.regex.pattern < other.regex.pattern:
                return True

        return False

class Application(tornado.web.Application):

    def __init__(self, **settings):
        self._handlers = OrderedDict()
        self.settings = settings

        if 'cookie_secret' not in self.settings:
            self.settings['cookie_secret'] = generate_cookie_secret()

        super(Application, self).__init__(**settings)

    def add_static_handler(self, pattern, folder=None,
                           default=None, index='index.html', priority=None):
        """
        :param static_folder:
        :param url_path: URL path pattern
        :param folder:
        :param index: the index file in URL path
        :param default: the default path if the url path is not accessible.
        """

        frame = sys._getframe(1)
        code_lineno = frame.f_lineno
        code_filename = frame.f_code.co_filename

        self._start_frame = sys._getframe(1)

        kwargs = dict(folder        = folder,
                      index_file    = index,
                      default_path  = default)

        self._add_handler(pattern, StaticFileHandler, kwargs=kwargs,
                            priority=100,
                            code_filename = code_filename,
                            code_lineno = code_lineno )


    def add_redirect(self, pattern, path=None, status_code=None, reason=None):

        frame = sys._getframe(1)
        code_lineno = frame.f_lineno
        code_filename = frame.f_code.co_filename
        if path is not None:
            kwargs = dict(status_code = status_code, reason = reason)

            self._add_handler(pattern, RaiseErrorHandler, kwargs=kwargs,
                                priority=100,
                                code_filename = code_filename,
                                code_lineno = code_lineno )

        elif status_code is not None:

            kwargs = dict(status_code = status_code, reason = reason)

            self._add_handler(pattern, RaiseErrorHandler, kwargs=kwargs,
                                priority=100,
                                code_filename = code_filename,
                                code_lineno = code_lineno )


    def add_module(self, pkg_or_module, priority=50):
        for module in iter_submodules(pkg_or_module):

            if not hasattr(module, '__http_route_spec_table__'):
                continue


            route_table = module.__http_route_spec_table__
            route_table.setup()

            for spec in route_table.route_specs:
                self._add_handler(spec.path_pattern, spec.handler_class,
                                    priority=priority,
                                    path=spec.path,
                                    code_filename = spec.code_filename,
                                    code_lineno = spec.code_lineno )


    def log_route_handlers(self):
        """show request handler specifictions"""
        if not self.handlers:
            self.logger.warn('No defined request handlers')
            return

        host_pattern, handlers = self.handlers[0]
        assert host_pattern.pattern == '.*$'

        segs = ['Found %d request handlers:' % len(handlers)]
        for spec in handlers:
            if spec.kwargs:
                kwargs_expr = ', '.join(['%s=%r' % (k,v)
                                            for k, v in spec.kwargs.items()])
            else:
                kwargs_expr = ''

            hcls = spec.handler_class
            assert hcls is not None
            if spec.path:
                s = "%s {%s} => %s(%s)"
                s %= (spec.path, spec.regex.pattern, hcls.__name__, kwargs_expr)
            else:
                s = "%s => %s(%s)"
                s %= (spec.regex.pattern, hcls.__name__, kwargs_expr)

            segs.append(s)

        self.logger.info('\n'.join(segs))


    def _add_handler(self, pattern, handler_class, path=None, kwargs=None,
                        priority=100, code_filename = None, code_lineno = None):

        if not self.handlers:
            host_pattern = re.compile(r'.*$')
            handlers = []
            self.handlers.append((host_pattern, handlers))
        else:
            host_pattern, handlers = self.handlers[0]
            assert host_pattern.pattern == '.*$'

        assert pattern is not None and handler_class is not None

        urlspec = OrderedURLSpec(priority, pattern, handler_class,
                                        path=path, kwargs=kwargs,
                                        code_filename=code_filename,
                                        code_lineno=code_lineno)

        bisect.insort_left(handlers, urlspec)

    def setup(self):
        self.log_route_handlers()
        self.add_handlers(".*$", self._handlers)

    @property
    def logger(self):
        if hasattr(self, '_logger'):
            return self._logger

        self._logger = logging.getLogger('webapp')
        setattr(self, '_logger', self._logger)

        return self._logger
