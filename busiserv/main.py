#! /usr/bin/env python3.6
# -*- coding: utf-8 -*-




if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='')
    parser.add_argument("-p", "--port", type=int, default=8700,
        help="port of service")
    args = parser.parse_args()

    import domainics.config

    domainics.config.load()

    import asyncio
    import uvloop
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy()) # 替换py缺省的主循环

    from tornado.platform.asyncio import AsyncIOMainLoop
    AsyncIOMainLoop().install() # 替换 tornado的主循环

    import domainics.tornice
    app = domainics.tornice.Application(debug=True, compress_response=True)
    app.add_module('serv')

    import login.handlers
    app.add_handler('/oauth/([_0-9a-zA-Z]+)', login.handlers.OAuthHandler)

    import domainics.server
    domainics.server.run_forever(app, port=args.port)
