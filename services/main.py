#! /usr/bin/env python3.6
# -*- coding: utf-8 -*-

import psycopg2.extensions
import psycopg2.extras
psycopg2.extensions.register_adapter(dict, psycopg2.extras.Json)

from domainics.tornice import Application
import domainics.server
import argparse



if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='')
    parser.add_argument("-p", "--port", type=int, default=8888,
        help="port of service")
    args = parser.parse_args()

    import domainics.config

    domainics.config.load()

    import asyncio
    import uvloop
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

    from tornado.platform.asyncio import AsyncIOMainLoop
    AsyncIOMainLoop().install()

    from domainics.tornice import Application
    app = Application(debug=True, compress_response=True)
    app.add_module('serv')

    from partner_auth.handlers import OAuthHandler
    app.add_handler('/oauth/([_0-9a-zA-Z]+)', OAuthHandler)

    domainics.server.run_forever(app, port=args.port)

    # import tornado.httpserver
    # server = tornado.httpserver.HTTPServer(app)
    # server.bind(8700)
    # server.start()
    #
    # import asyncio
    # import logging
    # import signal
    # import functools
    #
    # logger = logging.getLogger('busiserv-daemon')
    # def shutdown(signame):
    #     logger.info(f'server is shutting for signal {signame}')
    #     loop = asyncio.get_event_loop()
    #     loop.stop()
    #
    # loop = asyncio.get_event_loop()
    # for signame in ('SIGINT', 'SIGTERM'):
    #     loop.add_signal_handler(getattr(signal, signame),
    #                             functools.partial(shutdown, signame))
    #
    # loop.run_forever()
