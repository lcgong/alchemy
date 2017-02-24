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

from serv.quest import to_list_json

@rest.GET('/api/repos/{repos_sn:int}/trashed')
@transaction
def get_trashed_questions(repos_sn: int):

    dbc << """
    SELECT q.*,
      s.updated_ts AS saveforlater_updated_ts,
      t.labels AS tags, t.updated_ts AS tag_updated_ts,
      c.labels AS categories, c.updated_ts AS cat_updated_ts
    FROM ts_quest_trashed q
      LEFT JOIN ts_quest_saveforlater s USING(quest_sn)
      LEFT JOIN ts_quest_labels c ON c.quest_sn=q.quest_sn AND c.type='C'
      LEFT JOIN ts_quest_labels t ON t.quest_sn=q.quest_sn AND t.type='T'
    WHERE q.repos_sn = %(repos_sn)s
    ORDER BY q.trashed_ts DESC
    """
    dbc << dict(repos_sn=repos_sn)
    rows = list(dbc)

    return to_list_json(repos_sn, rows)


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
