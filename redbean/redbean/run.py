#! /usr/bin/env python
import sys
import traceback
import asyncio

from pathlib import Path

import aiohttp
from aiohttp.web_runner import AppRunner, TCPSite

import aiohttp_devtools
from aiohttp_devtools.logs import main_logger, rs_dft_logger as rs_logger
from aiohttp_devtools.runserver.config import Config
from aiohttp_devtools.runserver.serve import check_port_open, HOST


import watchgod

from click import style as _style

class AppTask():

    def __init__(self, app_module, host, port, loop: asyncio.AbstractEventLoop):
        self._reloads = 0
        self._runner = None

        self._host = host
        self._port = port
        self._app_module = app_module

        self._loop = loop
        self._task = None


        self._path = Path.cwd()
        
        self._awatch = watchgod.awatch(self._path)


    async def start(self):
        self._task = self._loop.create_task(self._run())


    async def _run(self):
        rs_logger.info('Watching: ' + str(self._path))

        try:
           await self._start_dev_server()
        except:
            rs_logger.error('Exception in loading app: ', exc_info=True)

        async for changes in self._awatch:
            self._reloads += 1
            if any(f.endswith('.py') for _, f in changes):
                rs_logger.info(_formatChanges(self._reloads, changes) + '\n')

                try:
                    await self._stop_dev_server()
                    await self._start_dev_server()
                except:
                    rs_logger.error('Exception in restaring app: ', exc_info=True)


    async def _start_dev_server(self):
        url = f'http://{self._host}:{self._port}'
        if self._reloads:
            msg = f'Restarting server at {url} '
            msg += _style(f'{self._reloads!s:^5}', bg='white', fg='red', bold=True)
        else:
            msg = f'Starting server at {url} ●'
        rs_logger.info(msg)

        app = await load_app(self._app_module)
        
        try:
            await check_port_open(self._port, self._loop)
        except asyncio.CancelledError:
            return

        self._runner = AppRunner(app, access_log_format='%r %s %b')
        await self._runner.setup()
        site = TCPSite(self._runner, host=self._host, port=self._port, 
                        shutdown_timeout=0.1)

        await site.start()
        

    async def _stop_dev_server(self):
        rs_logger.debug('stopping server process...')
        self._runner and await self._runner.cleanup()

    async def close(self):
        await self._stop_dev_server()

        if self._task:
            async with self._awatch.lock:
                if self._task.done():
                    self._task.result()
                self._task.cancel()


APP_FACTORY_NAMES = [
    'app',
    'app_factory',
    'get_app',
    'create_app',
]

from aiohttp_devtools.exceptions import AiohttpDevConfigError as AdevConfigError
from aiohttp_devtools.logs import rs_dft_logger as logger

import aiohttp
import inspect
import importlib

async def load_app(module_name):

    try:
        module_spec = importlib.util.find_spec(module_name)
        if module_spec is None:
            raise AdevConfigError(f"error importing '{module_name}'")

        module = module_spec.loader.load_module(module_name)
    except ImportError as exc:
        raise AdevConfigError(f"error importing '{module_name}'") from exc

    rs_logger.debug(f"successfully loaded '{module_name}'")

    try:
        factory_name = next(an for an in APP_FACTORY_NAMES if hasattr(module, an))
    except StopIteration as exc:
        raise AdevConfigError('No name supplied and no default app factory '
                                f'found in {module_name}') from exc
    else:
        rs_logger.debug(f"found default attribute '{factory_name}'"
                     f"in module '{module_name}'")

    try:
        app_factory = getattr(module, factory_name)
    except AttributeError as exc:
        raise AdevConfigError(f"Module '{module_name}' does not define "
                            f"a '{factory_name}' attribute/class") from exc

    if isinstance(app_factory, aiohttp.web.Application):
        app = app_factory
        return app

    # should be a proper factory with signature (loop): -> Application
    signature = inspect.signature(app_factory)
    if 'loop' in signature.parameters:
        loop = asyncio.get_event_loop()
        app = app_factory(loop=loop)
    else:
        app = app_factory() # loop argument missing, assume no arguments

    if asyncio.iscoroutine(app):
        app = await app

    if not isinstance(app, aiohttp.web.Application):
        raise AdevConfigError(f"app factory '{factory_name}' "
                    f"returned '{app.__class__.__name__}' not an "
                    f"aiohttp.web.Application")

    return app



def _formatChanges(reloads, changes):
    cwd = Path.cwd()
    formated_cwd = click.style(str(cwd) + '/', fg='white', dim=True)

    style = click.style

    ln = f'Found {len(changes)!s} changes, reload '
    lns = [ ln ]
    for _, f in changes:
        f = str(Path(f).relative_to(cwd))
        lns.append(' ' * 11 + formated_cwd + style(f, fg='yellow') )

    return '\n'.join(lns)

#-----------------------------------------------------------------------------
import click

_file_dir_existing = click.Path(exists=True, dir_okay=True, file_okay=True)

host_help = ('host with default of localhost. env variable AIO_HOST')
port_help = 'Port to serve app from, default 8000. env variable: AIO_PORT'
@click.command()
@click.argument('app-module', type=str, required=True)
@click.option('-H', '--host', envvar='AIO_HOST', default='localhost', help=host_help)
@click.option('-p', '--port', 'port', envvar='AIO_PORT', type=click.INT, help=port_help)
@click.option('-v', '--verbose', is_flag=True, help='Enable verbose output.')
@click.option('--prod', is_flag=True, default=False, help='Enable production mode')
def main(**config):
    aiohttp_devtools.logs.setup_logging(config['verbose'])
    
    app_module = config['app_module']
    module_spec = importlib.util.find_spec(app_module)
    if module_spec is None:
        msg = click.style(f"Not Found Module: '{app_module}'", fg='red')
        rs_logger.warn(msg)
        exit(1)

    is_prod = config.pop('prod')
    if not is_prod:
        run_devserver(**config)
    else:
        run_prodserver(**config)

def run_devserver(**config):
    
    try:
        loop = asyncio.get_event_loop()

        app_module = config['app_module']
        host = config['host']
        port = config['port']

        main_manager = AppTask(app_module, host, port, loop)

        try:
            loop.run_until_complete(main_manager.start())
            loop.run_forever()
        except KeyboardInterrupt:  # pragma: no branch
            pass
        finally:
            rs_logger.info('shutting down server...')
            start = loop.time()
            try:
                loop.run_until_complete(main_manager.close())
                loop.run_until_complete(main_manager._runner.cleanup())
            except asyncio.CancelledError:
                pass
            except (asyncio.TimeoutError, KeyboardInterrupt):
                pass
            finally:
                rs_logger.debug('shutdown took %0.2fs', loop.time() - start)        

    except aiohttp_devtools.exceptions.AiohttpDevException as e:
        if config['verbose']:
            tb = click.style(traceback.format_exc().strip('\n'), fg='white', dim=True)
            main_logger.warning('AiohttpDevException traceback:\n%s', tb)
        main_logger.error('Error: %s', e)
        sys.exit(2)

def run_prodserver(**config):
    raise NotImplementedError()

if __name__ == '__main__':
    main()
