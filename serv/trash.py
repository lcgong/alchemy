# -*- coding: utf-8 -*-

import re
import json

from datetime import datetime
from domainics.db import dbc, transaction, dmerge, drecall
from domainics.tornice import route_base, rest, webreq
from domainics import busilogic
from domainics.domobj import dset, dobject, datt, DSet, DPage

route_base('/api/quest/')

from schema.quest import ts_quest, ts_quest_seqno
from schema.quest import ts_quest_labels
from schema.quest import ts_quest_saveforlater
from schema.quest import ts_quest_trashed

from serv.label import find_labels, ts_label


@rest.DELETE('/api/quest/{quest:int}')
@transaction
def trash_quest(quest_sn: int):
    """  """

    quest = drecall(ts_quest(quest_sn = quest_sn))
    if not quest:
        busilogic.fail('所删除的试题(%s)不存在' % quest_sn)


    trash = ts_quest_trashed(quest)
    dmerge(trash)

    dbc << "DELETE FROM ts_quest WHERE quest_sn=%(quest_sn)s"
    dbc << (quest_sn,)


@rest.POST('/api/quest/{quest:int}/trashed')
@transaction
def recycle_quest_(quest_sn: int):
    """  """

    trash = drecall(ts_quest_trashed(quest_sn = quest_sn))
    if not trash:
        busilogic.fail('所删除的试题(%s)不存在' % quest_sn)

    quest = ts_quest(trash)
    dmerge(quest)

    dbc << "DELETE FROM ts_quest_trashed WHERE quest_sn=%(quest_sn)s"
    dbc << (quest_sn,)


@rest.DELETE('/api/quest/{quest:int}/trashed')
@transaction
def purge_quest_(quest_sn: int):
    """  """

    quest = drecall(ts_quest(quest_sn = quest_sn))
    if not quest:
        busilogic.fail('所删除的试题(%s)不存在' % quest_sn)

    dbc << "DELETE FROM ts_quest WHERE quest_sn=%(quest_sn)s"
    dbc << (quest_sn,)
