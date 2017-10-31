# -*- coding: utf-8 -*-

from domainics import P, transaction, sqltext
from domainics.tornice import route_base, rest

@rest.GET(r'/inc/{n:int}')
@transaction
async def inc(n: int):
    T = sqltext(('({i}, { i + 100 })' for i in range(5)), sep=',')
    sn = 3
    P.sql("SELECT * FROM (VALUES {T}) d(s, v) WHERE s={sn};\n")
    r = P.sql.firstrow
    assert r

    return n + r.v

@rest.GET.POST(r'/hi')
@transaction
@transaction.sql_b(dsn="DEFAULT", autocommit=True)
async def hi():
    n = await inc(100)

    P.sql << "SELECT pg_backend_pid() as pid FOR UPDATE";
    row1 = next(P.sql)
    #
    # P.sql_b << "SELECT pg_backend_pid() as pid";
    # row2 = next(P.sql_b)

    return {"pids": [row1.pid, row2.pid], "n": n}
