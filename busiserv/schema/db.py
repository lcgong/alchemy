# -*- coding: utf-8 -*-

from domainics.db import transaction, dbc, DBSchema

# from schema.post import create_views

@transaction(dsn='postgres', autocommit=True)
def create_dbuser(username, password):
    dbc << "SELECT rolname FROM pg_roles WHERE rolname=%(username)s"
    dbc << dict(username=username)
    row = next(dbc, None)
    if not row:
        dbc << """
        CREATE ROLE "%(username)s" LOGIN
        ENCRYPTED PASSWORD 'md568cefad35fed037c318b1e44cc3480cf'
        NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;
        """ % dict(username=username, password=password)
        print("Database User (%s) created." % username)


@transaction(dsn='postgres', autocommit=True)
def create_database(database, username):
    dbc << "SELECT 1 as a FROM pg_catalog.pg_database d WHERE datname=%(database)s"
    dbc << dict(database=database)
    row = next(dbc, None)
    if not row:

        #创建数据必须使用autocommit=True的方式
        dbc << """
        CREATE DATABASE %(database)s  WITH OWNER=%(username)s ENCODING = 'UTF8'
        """ % dict(database=database, username=username)
        print('Database (%s) created.' % database)

import schema.post as post


def create_tables():
    schema = DBSchema()

    schema.add_module('schema')

    # post.drop_views()
    schema.drop()
    schema.create()

    # create_views()
