#! /usr/bin/env python3

import yaml
import logging.config
from pathlib import Path
with Path('config/logging.yaml').open() as config:
    logging.config.dictConfig(yaml.load(config))


import redbean
import domainics.redbean
from domainics.db import set_dsn

from sqlblock.asyncpg import set_dsn


set_dsn(dsn='db', url="postgresql://postgres@localhost/test")


app = redbean.Application()
domainics.redbean.setup(app)

app.add_module('serv', prefix='/')
