
import logging
logger = logging.getLogger(__name__)

from redbean.logs import setup_logging 
from pathlib import Path 
setup_logging(config=Path(__file__).parent / 'conf/logging.yaml')


import aiohttp
import redbean
rest = redbean.Routes() 

def create_app():

    app = aiohttp.web.Application()
    app['secure_key'] = 'DjwennlKciQiTlxKmYtWqH8N'
    app['etcd_endpoint'] = "127.0.0.1:2379"

    rest.setup(app)
    rest.add_module('serv2', prefix='/api')
    
    return app

# python -m redbean.run -p 8500 test/security/app.py


