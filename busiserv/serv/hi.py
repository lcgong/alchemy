# -*- coding: utf-8 -*-

from domainics.db import dbc, transaction, dmerge, drecall
from domainics.tornice import route_base, rest, webreq
from domainics import busilogic
from domainics.domobj import dset, dobject, datt, DSet, DPage


from domainics.pillar import P

@rest.GET(r'/inc/{n:int}')
@transaction(alias='sql_a')
@transaction(alias='sql_b')
async def inc(n: int):
    P.sql_b("SELECT 100 AS id")
    P.sql_a("SELECT 100 AS id")

    return n + 1

@rest.GET.POST(r'/hi')
@transaction.sql_a
@transaction.sql_b(dsn="DEFAULT", autocommit=True)
async def hi():
    P.sql_a << "SELECT pg_backend_pid() as pid FOR UPDATE";
    row1 = next(P.sql_a)

    P.sql_b << "SELECT pg_backend_pid() as pid";
    row2 = next(P.sql_b)

    n = await inc(100)

    return {"pids": [row1.pid, row2.pid], "n": n}
