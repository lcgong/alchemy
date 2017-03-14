
# -*- coding: utf-8 -*-

import re
from datetime import datetime
from domainics.db import dbc, transaction, dmerge, drecall
from domainics.tornice import route_base, rest, webreq
from domainics import busilogic
from domainics.domobj import dset, dobject, datt, DSet, DPage

from schema.user import sys_user, sys_user_seqno

route_base('/api/repos/')


from serv.user import get_user, current_user

from schema.repos import ts_repos, ts_repos_seqno, ts_repos_user

from schema.repos import ts_repos_queststyles
from schema.repos import ts_repos_tags
from schema.repos import ts_repos_categories

from schema.label import ts_label, ts_label_seqno


@rest.GET(r'{repos_sn:int}/desc')
@transaction
def get_repos_desc(repos_sn):
    """  """

    repos = drecall(ts_repos(repos_sn = repos_sn))
    return repos


@rest.GET(r'{repos_sn:int}/brief')
@transaction
def get_repos_brief_summary(repos_sn):
    """  """
    # TODO
    repos = drecall(ts_repos(repos_sn = repos_sn))
    return repos



@rest.GET(r'list')
@transaction
def list_repos(page: DPage):
    """取得用户信息"""

    user_sn = webreq.principal_id

    dbc << "SELECT * FROM ts_repos WHERE ower_sn=%(user_sn)s"
    dbc << dict(user_sn=user_sn)

    used = next(dbc)
    # print(webreq.principal_id, get_user(webreq.principal_id).user_sn)
    # print(current_user());


    return current_user()


@rest.GET(r'list/brief/{source:str}')
@transaction
def list_repos_briefs(source:str, page: DPage):
    """取得用户信息"""

    user_sn = webreq.principal_id

    dbc << """
    SELECT r.* FROM ts_repos r JOIN ts_repos_user USING (repos_sn)
    WHERE user_sn=%(user_sn)s
    """
    dbc << dict(user_sn=user_sn)
    ReposSet = dset(ts_repos)

    return ReposSet(dbc)




@rest.POST('')
@rest.PUT('{repos_sn:int}')
@transaction
def save_repos(repos_sn: int, repos: ts_repos):
    """保存题库信息"""

    now = datetime.utcnow();
    user_sn = webreq.principal_id

    if not repos_sn or repos.repos_sn == 0:
        repos = ts_repos(repos, repos_sn = ts_repos_seqno())
        repos.updated_ts = now
        repos.created_ts = now

        dmerge(repos)

        repos_user = ts_repos_user(repos_sn=repos.repos_sn, user_sn=user_sn)
        repos_user.type = 'O'
        repos_user.updated_ts = now

        dmerge(repos_user)

        return repos

    RestrictedHost = ts_repos._re(_ignore=['created_ts'])
    repos = RestrictedHost(repos, updated_ts = now)
    original = drecall(repos)
    original.updated_ts = now
    dmerge(repos, original)

    return repos


@rest.DELETE('{repos_sn:int}')
@transaction
def delete_repos(repos_sn: int):
    """  """

    repos = drecall(ts_repos(repos_sn = repos_sn))
    if not repos:
        busilogic.fail('所删除的题目库(%s)不存在' % repos_sn)

    dbc << "DELETE FROM ts_repos WHERE repos_sn=%s"
    dbc << (repos_sn,)
    if dbc.rowcount < 1:
        busilogic.fail('无删除对象: %s' % repos_sn)
