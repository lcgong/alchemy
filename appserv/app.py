
import yaml
import logging.config
from pathlib import Path
with Path('config/logging.yaml').open() as config:
    logging.config.dictConfig(yaml.load(config))


from sqlblock.asyncpg import set_dsn
set_dsn(dsn='db', url="postgresql://postgres@localhost/test")

import aiohttp


def create_app(loop):
    import redbean # TODO 不再使用全局变量，避免在reload时发生问题
    import domainics.redbean


    routes = redbean.RouteModules('serv')

    app = aiohttp.web.Application()
    domainics.redbean.setup(app)
    routes.setup(app)

    return app

