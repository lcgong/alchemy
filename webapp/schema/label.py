# -*- coding:utf-8 -*-

from datetime import date, datetime
from domainics.db import dsequence, dtable, datt, json_object

class ts_label_seqno(dsequence):
    """Tag和Category的Label序号 """
    start = 10000
    step  = 1

class ts_label(dtable):
    """QuestionStyles, Tag和Category的Label信息"""

    repos_sn   = datt(int, doc="库序号")
    label_sn   = datt(ts_label_seqno, doc='标签序号，库内同名同号，同名不同库号不同')
    label      = datt(str, doc='标签名')

    type       = datt(str, len=1, doc='标签类型: S题型,T标签,C分类')
    props      = datt(json_object, doc='标签其他定义信息，如颜色、图标等')
    created_ts = datt(datetime,  doc='更新时间')
    updated_ts = datt(datetime,  doc='更新时间')
    notes      = datt(str, doc='标签使用说明')

    __dobject_key__ = [label_sn]
