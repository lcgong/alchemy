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

    styles     = datt(json_object, doc='题库定义的题型')
    tags       = datt(json_object, doc='题库定义的标签')
    categories = datt(json_object, doc='题库定义的分类')

    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [repos_sn]
