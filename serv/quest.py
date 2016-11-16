
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

from serv.label import find_labels, ts_label

@rest.POST('/api/repos/{repos_sn}/quest(:?/?)')
@rest.PUT('{quest_sn:int}')
@transaction
def new_or_save_question(repos_sn: int, quest_sn: int, json_arg):
    """创建或保存试题"""

    now = datetime.utcnow();
    user_sn = webreq.principal_id

    orig_quest = None
    if not quest_sn:
        # 新建的
        quest = ts_quest(quest_sn=ts_quest_seqno(), repos_sn=repos_sn)
        quest.created_ts = now
    else:
        # 保存的
        quest = drecall(ts_quest(quest_sn=quest_sn))
        if not quest:
            busilogic.fail('找不到试题%d' % quest_sn)

        orig_quest = ts_quest(quest)

    purpose = json_arg['purpose']
    if purpose:
        quest.purpose_testing = purpose['testing']
        quest.purpose_exercising = purpose['exercising']

    quest.editing_text    = json_arg['editing_text']
    quest.testing_text    = json_arg['testing_text']

    quest.blank_signature = json.dumps(json_arg['blank_signature'])

    if 'question_style' in json_arg:
        question_style = json_arg['question_style']

        # 将题型转换成题型的标签号
        found_labels = find_labels(repos_sn, [question_style], 'S')
        if question_style in found_labels:
            quest.question_style = found_labels[question_style]

    quest.updated_ts = now

    dmerge(quest, orig_quest)

    if not quest_sn:
        # 如果是新建的还需要，一并处理已经打的分类和标签

        if 'saveforlater' in json_arg and json_arg['saveforlater']:
            put_saveforlater(quest.quest_sn, {'status': True})

        if 'tags' in json_arg:
            _put_labels(repos_sn, quest.quest_sn, json_arg['tags'], 'T')

        if 'categories' in json_arg:
            _put_labels(repos_sn, quest.quest_sn, json_arg['categories'], 'C')

    # After it is created, a value should be returned  with a new seqno
    return quest

@rest.GET('{quest_sn:int}')
@transaction
def get_quest(quest_sn: int):
    """ """
    quest = drecall(ts_quest(quest_sn=quest_sn))

    data = {}
    data['quest_sn']   = quest.quest_sn
    data['repos_sn']   = quest.repos_sn
    data['created_ts'] = quest.created_ts
    data['updated_ts'] = quest.updated_ts

    data['editing_text'] = quest.editing_text
    data['testing_text'] = quest.testing_text

    data['purpose'] = {
        'testing': bool(quest.purpose_testing),
        'exercising': bool(quest.purpose_exercising)
    }

    # question_style     = datt(int,  doc='题型')
    # #
    if quest.question_style is not None:
        label = drecall(ts_label(label_sn=quest.question_style))
        if not label:
            busilogic.fail('找不到题型标签：%d' % quest.question_style)

        data['question_style'] = label.label

    data['saveforlater'] = get_saveforlater(quest_sn)
    data['tags']         = get_labels(quest_sn, 'tags')
    data['categories']   = get_labels(quest_sn, 'categories')

    return data

@rest.GET('{quest_sn:int}/saveforlater')
@transaction
def get_saveforlater(quest_sn: int):

    saveforlater = drecall(ts_quest_saveforlater(quest_sn=quest_sn))
    if not saveforlater:
        return None

    return saveforlater


@rest.PUT('{quest_sn:int}/saveforlater')
@transaction
def put_saveforlater(quest_sn: int, json_arg):
    """创建或保存试题"""

    status = json_arg['status'] # true or false

    old_sfl = drecall(ts_quest_saveforlater(quest_sn=quest_sn))

    new_sfl = ts_quest_saveforlater(quest_sn=quest_sn)

    new_sfl.updated_ts = datetime.utcnow() if status else None
    dmerge(new_sfl, old_sfl)


@rest.GET('{quest_sn:int}/{target:tags|categories}')
@transaction
def get_labels(quest_sn: int, target):
    """"""

    if target == 'tags':
        label_type = 'T'
    elif target == 'categories':
        label_type = 'C'
    else:
        busilogic.fail('!');

    dbc << """\
    WITH s AS (
      SELECT UNNEST(labels) AS label_sn, updated_ts
      FROM ts_quest_labels
      WHERE quest_sn = %(quest_sn)s AND type=%(label_type)s
    )
    SELECT t.label, s.label_sn, s.updated_ts, t.props
    FROM ts_label t JOIN s USING(label_sn)
    """
    dbc << dict(quest_sn=quest_sn, label_type=label_type)

    data = {}
    for r in dbc:
        props = r.props if r.props else {}
        props['label_sn'] = r.label_sn
        props['updated_ts'] = r.updated_ts

        data[r.label] = props

    return data


@rest.PUT('{quest_sn:int}/{target:tags|categories}')
@transaction
def put_labels(quest_sn: int, target, json_arg):
    """"""

    quest = drecall(ts_quest(quest_sn=quest_sn))
    if not quest:
        busilogic.fail('没找到试题： %d', quest_sn)

    if target == 'tags':
        return _put_labels(repos_sn, quest_sn, json_arg, 'T')
    elif target == 'categories':
        return _put_labels(repos_sn, quest_sn, json_arg, 'C')
    else:
        busilogic.fail('!');

def _put_labels(repos_sn, quest_sn, label_texts, label_type):
    """"""

    found_labels = find_labels(repos_sn, label_texts, label_type)

    not_founds = list(filter(lambda t: t not in found_labels, label_texts))
    if not_founds:
        busilogic.fail('没找到标签号: %s' % ', '.join(not_founds))

    quest_label = ts_quest_labels(quest_sn=quest_sn, type = label_type)
    quest_label.labels = [sn for sn in found_labels.values()]
    quest_label.updated_ts = datetime.utcnow()

    dmerge(quest_label, drecall(ts_quest_labels(quest_sn=quest_sn)))

@rest.DELETE('{quest:int}')
@transaction
def delete_quest(quest_sn: int):
    """  """

    quest = drecall(ts_quest(quest_sn = quest_sn))
    if not quest:
        busilogic.fail('所删除的试题(%s)不存在' % quest_sn)

    dbc << "DELETE FROM ts_quest WHERE quest_sn=%(quest_sn)s"
    dbc << (quest_sn,)
