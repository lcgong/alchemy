
import aiohttp.web

from .route import register_module

class Application(aiohttp.web.Application):

    def __init__(self, *args, **kwargs):
        super(Application, self).__init__(**kwargs)
        self.on_startup.append(_on_startup)

    def add_module(self, root, *, prefix='/'):
        return register_module(self, root, prefix=prefix)


def _on_startup(app):
    print_route_specs(app)

def print_route_specs(app):
    infos = []
    for resource in app.router._resources:
        for route in resource:
            method = route.method
            formatter = route._resource._formatter
            func_name = route._routespec_handler.__qualname__
            module_name = route._routespec_handler.__module__
            infos.append(f"[{method}]{formatter} => {func_name} in {module_name}")

    app.logger.info('Route Definition:\n' + '\n'.join(infos) + '\n')
