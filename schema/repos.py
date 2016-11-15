# -*- coding:utf-8 -*-

from datetime import date, datetime
from domainics.db import dsequence, dtable, datt, json_object

class ts_repos_seqno(dsequence):
    """题库序号 """
    start = 10000
    step  = 1

class ts_repos(dtable):
    """题库"""

    repos_sn   = datt(ts_repos_seqno, doc='题库号')
    title      = datt(str,   doc='标题')
    brief_desc = datt(str,   doc='简短描述')
    full_desc  = datt(str,   doc='详细描述')

    updated_ts = datt(datetime,  doc='更新时间')
    created_ts = datt(datetime,  doc='创建时间')

    __dobject_key__ = [repos_sn]

class ts_repos_queststyles(dtable):
    """题库"""

    repos_sn   = datt(int, doc='题库号')
    labels     = datt(json_object, doc='题库定义的题型')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn]

class ts_repos_tags(dtable):
    """题库"""

    repos_sn   = datt(int, doc='题库号')
    labels     = datt(json_object, doc='题库定义的标签')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn]

class ts_repos_categories(dtable):
    """题库"""

    repos_sn   = datt(int, doc='题库号')
    labels     = datt(json_object, doc='题库定义的分类')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn]

class ts_repos_users(dtable):
    """题库成员或订阅者关系"""
    repos_sn   = datt(ts_repos_seqno, doc='题库号')
    user_sn    = datt(int, doc='题库的所有者序号')
    type       = datt(str, len=1, doc='成员关系： O所有者;C合作者;')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn, user_sn]
