# -*- coding:utf-8 -*-

from datetime import date, datetime
from domainics.db import dsequence, dtable, datt, json_object, array

class ts_quest_seqno(dsequence):
    """ 题号序号 """
    start = 10000
    step  = 1

class ts_quest(dtable):
    """ """

    quest_sn  = datt(ts_quest_seqno, doc='题号')
    repos_sn  = datt(int, len=4, doc="题库号")

    purpose_testing    = datt(bool, doc="考试用")
    purpose_exercising = datt(bool, doc="练习用")

    question_style     = datt(int,  doc='题型序号: ts_label的S类型序号')

    editing_text       = datt(str,   doc='编辑版题目文本')
    testing_text       = datt(str,   doc='测试版题目文本（不含解答）')

    """
    signature: 序号从0开始计数
    [
        #题空#
        [ [第一个题空所对应的选项组序号, [答案]], 第二个....  ],

        #选项组#
        [第一个选项组的选项数, 第二个选项组的选项数, ...]
    ]
    """
    blank_signature = datt(json_object, doc=(''))

    created_ts      = datt(datetime,  doc='创建时间')
    updated_ts      = datt(datetime,  doc='更新时间')

    __dobject_key__ = [quest_sn]


class ts_quest_saveforlater(dtable):
    """题目的SaveForLater(表内有记录，就表示已经打了标签，否则没打)"""

    quest_sn   = datt(ts_quest_seqno, doc='题号')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [quest_sn]

class ts_quest_labels(dtable):
    """题目的标签(Tag)"""

    quest_sn   = datt(ts_quest_seqno, doc='题号')
    type       = datt(str, len=1, doc='标签类型: T标签, C分类')
    labels     = datt(array(int), doc='标签')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [quest_sn, type]
