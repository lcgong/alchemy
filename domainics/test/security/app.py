
import logging

from pathlib import Path 

import aiohttp

logger = logging.getLogger(__name__)

import redbean # TODO 不再使用全局变量，避免在reload时发生问题
import domainics.redbean


logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '[%(asctime)s] %(message)s',
            'datefmt': '%H:%M:%S',
        },
    },
    'handlers': {
        'default': {
            'level': 'DEBUG',
            # 'class': 'aiohttp_devtools.logs.DefaultHandler',
            'class':'logging.StreamHandler',
            'formatter': 'default'
        },
    },    
    'loggers': {
        'test': {
            'handlers': ['default'],
            'level': 'DEBUG',
        },
    }
})


def create_app():

    logger.setLevel(logging.DEBUG)

    # logging.basicConfig(level=logging.DEBUG,
    #                     format='%(asctime)s %(levelname)s %(message)s')

    routes = redbean.RouteModules('test.security.serv', prefix='/api')

    app = aiohttp.web.Application()
    app['secure_key'] = 'DjwennlKciQiTlxKmYtWqH8N'
    domainics.redbean.setup(app)
    routes.setup(app) 


    logger.debug('test')


    return app


print(__file__)
# python -m domainics.run -p 8500 test/security/app.py


