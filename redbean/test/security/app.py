
import logging
logger = logging.getLogger(__name__)


from redbean.logs import setup_logging 
from pathlib import Path 
setup_logging(config=Path(__file__).parent / 'logging.yaml')

import aiohttp

import redbean
rest = redbean.Routes() 

secure_key = 'DjwennlKciQiTlxKmYtWqH8N' 
etcd_endpoint = "127.0.0.1:2379"

def create_app(): 
    app = aiohttp.web.Application() 
    app['secure_key'] = 'DjwennlKciQiTlxKmYtWqH8N'
    app['etcd_endpoint'] = "127.0.0.1:2379"

    print(33211)
    rest.setup(app)
    rest.add_module('test.security.serv', prefix='/api') 
    
    return app

# python -m redbean.run -p 8500 test/security/app.py


