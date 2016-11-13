# -*- coding:utf-8 -*-

from datetime import date, datetime
from domainics.db import dsequence, dtable, datt, json_object

class ts_label_seqno(dsequence):
    """Tag和Category的Label序号 """
    start = 10000
    step  = 1

class ts_label(dtable):
    """Tag和Category的Label信息"""

    label_sn   = datt(ts_label_seqno, doc='题号')
    label      = datt(str,   doc='标签')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [label_sn]
