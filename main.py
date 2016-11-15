#! /usr/bin/env python3.5
# -*- coding: utf-8 -*-

import psycopg2.extensions
import psycopg2.extras
psycopg2.extensions.register_adapter(dict, psycopg2.extras.Json)

from domainics.tornice import Application
import domainics.server
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='ShuiZhuYu')
    parser.add_argument("-p", "--port", type=int, default=8888,
        help="port of service")
    args = parser.parse_args()

    import domainics.config

    domainics.config.load()

    from domainics.tornice import Application
    app = Application(debug=True, compress_response=True)
    app.add_module('serv')
    app.add_redirect('/api/(.*)', status_code=404)

    app.add_static_handler('/jspm_packages/(.*)', folder='jspm_packages')
    app.add_static_handler('/build/(.*)', folder='build')
    app.add_static_handler('/app/(.*)', folder='app')
    app.add_static_handler('/(.*)', folder='app', default='/index.html')

    domainics.server.run_forever(app, port=args.port)
