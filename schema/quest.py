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

    for_testing    = datt(bool, doc="考试用")
    for_exercising = datt(bool, doc="练习用")
    question_style = datt(str,  doc='题型')

    editingText    = datt(str,   doc='编辑版题目文本')
    testingText    = datt(str,   doc='测试版题目文本（不含解答）')

    solution_sig   = datt(json_object, doc=('答案信息: '
                        '[blank_no, option_group_no, option_num, ["A",...]]'))

    created_ts     = datt(datetime,  doc='创建时间')
    updated_ts     = datt(datetime,  doc='更新时间')

    __dobject_key__ = [quest_sn]


class ts_quest_saveforlater(dtable):
    """题目的SaveForLater(表内有记录，就表示已经打了标签，否则没打)"""

    quest_sn   = datt(ts_quest_seqno, doc='题号')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [quest_sn]

class ts_quest_tag(dtable):
    """题目的标签(Tag)"""

    quest_sn   = datt(ts_quest_seqno, doc='题号')
    tags       = datt(array(int), doc='标签')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [quest_sn]

class ts_quest_cat(dtable):
    """题目的知识分类(Category)，人为限制两级分类"""

    quest_sn   = datt(ts_quest_seqno, doc='题号')
    categories = datt(array(int), doc='分类')
    updated_ts = datt(datetime,  doc='更新时间')

    __dobject_key__ = [quest_sn]
