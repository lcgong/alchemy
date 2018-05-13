import asyncio
import contextlib
import os

from app import app


from aiohttp import web
routes = web.RouteTableDef()

@routes.get('/')
async def hello(request):
    return web.Response(text="Hello, world")

# app = web.Application()
app.add_routes(routes)

web.run_app(app)


# from aiohttp.web_runner import AppRunner, TCPSite

# # from ..logs import rs_dft_logger as logger
# # from .config import Config
# # from .serve import HOST, check_port_open, create_auxiliary_app
# # from .watch import AppTask, LiveReloadTask


# def run_app(app, port, loop):
#     runner = AppRunner(app, access_log=None)
#     loop.run_until_complete(runner.setup())

#     site = TCPSite(runner, HOST, port, shutdown_timeout=0.01)
#     loop.run_until_complete(site.start())

#     try:
#         loop.run_forever()
#     except KeyboardInterrupt:  # pragma: no branch
#         pass
#     finally:
#         # logger.info('shutting down server...')
#         start = loop.time()
#         with contextlib.suppress(asyncio.TimeoutError, KeyboardInterrupt):
#             loop.run_until_complete(runner.cleanup())
#         # logger.debug('shutdown took %0.2fs', loop.time() - start)

# from app import app

# loop = asyncio.get_event_loop()

# run_app(app, 8500, loop) 