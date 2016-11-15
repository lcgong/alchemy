# -*- coding:utf-8 -*-

from datetime import date, datetime
from domainics.db import dsequence, dtable, datt, json_object, array

class ts_repos_seqno(dsequence):
    """题库序号 """
    start = 10000
    step  = 1

class ts_batch_seqno(dsequence):
    """批号 """
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
    labels     = datt(array(int), doc='题库定义的题型')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn]

class ts_repos_tags(dtable):
    """题库"""

    repos_sn   = datt(int, doc='题库号')
    labels     = datt(array(int), doc='题库定义的标签')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn]

class ts_repos_categories(dtable):
    """题库"""

    repos_sn   = datt(int, doc='题库号')
    labels     = datt(array(int), doc='题库定义的分类')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn]

class ts_repos_user(dtable):
    """题库成员关系"""
    repos_sn     = datt(ts_repos_seqno, doc='题库号')
    user_sn      = datt(int, doc='题库的所有者序号')
    type         = datt(str, len=1, doc='成员关系： O所有者; C合作者')
    pinned       = datt(datetime,  doc='成员对库打标签的时间，设置为null表示取消标签')
    updated_ts   = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn, user_sn]

class ts_repos_subscrib(dtable):
    """题库的订阅关系"""
    repos_sn   = datt(ts_repos_seqno, doc='题库号')
    batch_sn   = datt(int, doc='订阅组号')
    user_sn    = datt(int, doc='题库的所有者序号')

    state      = datt(str, len=1, doc='状态： A有效的; C库关闭的, D用户退订的')

    pinned     = datt(datetime,  doc='订阅者对库打标签，有时间的表示已打，null已取消标签')

    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn, user_sn]


class ts_repos_batch(dtable):
    """题库订阅批号"""
    repos_sn      = datt(ts_repos_seqno, doc='题库号')
    batch_sn      = datt(int, doc='题库订阅批号')

    title         = datt(str, doc='批号名称')
    state         = datt(str, len=1, doc='状态： A有效; C关闭')
    notes         = datt(str, doc='')

    pinned        = datt(datetime,  doc='近期常用批号标志，设置为null表示取消标签')

    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn, batch_sn]
