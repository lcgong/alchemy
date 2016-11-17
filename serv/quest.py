
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


@rest.GET('/api/repos/{repos_sn:int}/quest/saveforlater')
@transaction
def list_saveforlater_questions(repos_sn: int, source):
    """ """

    dbc << """
    SELECT q.*,
      s.updated_ts AS saveforlater_updated_ts,
      t.labels AS tags, t.updated_ts AS tag_updated_ts,
      c.labels AS categories, c.updated_ts AS cat_updated_ts
    FROM ts_quest q
      JOIN ts_quest_saveforlater s USING(quest_sn)
      LEFT JOIN ts_quest_labels c ON c.quest_sn=q.quest_sn AND c.type='C'
      LEFT JOIN ts_quest_labels t ON t.quest_sn=q.quest_sn AND t.type='T'
    WHERE q.repos_sn = %(repos_sn)s
    ORDER BY s.updated_ts DESC
    """
    dbc << dict(repos_sn=repos_sn)
    rows = list(r for r in dbc)

    return to_list_json(repos_sn, rows)

@rest.GET('/api/repos/{repos_sn:int}/quest/(:?recent|all)')
@transaction
def list_recent_questions(repos_sn: int, source):
    """ """

    dbc << """
    SELECT q.*,
      s.updated_ts AS saveforlater_updated_ts,
      t.labels AS tags, t.updated_ts AS tag_updated_ts,
      c.labels AS categories, c.updated_ts AS cat_updated_ts
    FROM ts_quest q
      LEFT JOIN ts_quest_saveforlater s USING(quest_sn)
      LEFT JOIN ts_quest_labels c ON c.quest_sn=q.quest_sn AND c.type='C'
      LEFT JOIN ts_quest_labels t ON t.quest_sn=q.quest_sn AND t.type='T'
    WHERE q.repos_sn = %(repos_sn)s
    ORDER BY q.updated_ts DESC
    """
    dbc << dict(repos_sn=repos_sn)
    rows = list(dbc)

    return to_list_json(repos_sn, rows)

def to_list_json(repos_sn, rows):
    print(rows)

    labels = get_label_sn_dict(repos_sn)

    data = []
    for quest in rows:
        item = {}
        item['quest_sn']   = quest.quest_sn
        item['created_ts'] = quest.created_ts
        item['updated_ts'] = quest.updated_ts

        item['text']       = quest.testing_text

        item['purpose'] = {
            'testing': bool(quest.purpose_testing),
            'exercising': bool(quest.purpose_exercising)
        }

        item['questionStyle'] = labels.get(quest.question_style, None)

        item['saveForLater'] = quest.saveforlater_updated_ts



        item['tags'] = { labels[s]: {
                                        'updated_ts': quest.tag_updated_ts
                                    }
                        for s in quest.tags }

        item['categories'] = { labels[s]: {
                                        'updated_ts': quest.cat_updated_ts
                                    }
                        for s in quest.categories }

        data.append(item)

    return data

def get_label_sn_dict(repos_sn):
    labels = {}
    dbc << """
    SELECT label, label_sn, props
    FROM ts_label WHERE repos_sn=%(repos_sn)s
    """
    dbc << dict(repos_sn=repos_sn)
    for r in dbc:
        labels[r.label_sn] = r.label

    return labels

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

    status = bool(json_arg['status']) # true or false
    if status:
        old_sfl = drecall(ts_quest_saveforlater(quest_sn=quest_sn))

        new_sfl = ts_quest_saveforlater(quest_sn=quest_sn)

        new_sfl.updated_ts = datetime.utcnow() if status else None
        dmerge(new_sfl, old_sfl)

        return new_sfl
    else:
        dbc << """
        DELETE FROM ts_quest_saveforlater
        WHERE quest_sn = %(quest_sn)s
        """
        dbc << dict(quest_sn=quest_sn)

        return None


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

    return _get_labels(quest_sn, label_type)

def _get_labels(quest_sn, label_type):

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
        label_type = 'T'

    elif target == 'categories':
        label_type = 'C'
    else:
        busilogic.fail('!');

    _put_labels(quest.repos_sn, quest_sn, json_arg, label_type)

    return _get_labels(quest.quest_sn, label_type)


def _put_labels(repos_sn, quest_sn, label_texts, label_type):
    """"""

    found_labels = find_labels(repos_sn, label_texts, label_type)

    not_founds = list(filter(lambda t: t not in found_labels, label_texts))
    if not_founds:
        busilogic.fail('没找到标签号: %s' % ', '.join(not_founds))

    quest_label = ts_quest_labels(quest_sn=quest_sn, type = label_type)
    quest_label.labels = [sn for sn in found_labels.values()]
    quest_label.updated_ts = datetime.utcnow()

    original = drecall(ts_quest_labels(quest_sn=quest_sn, type = label_type))
    dmerge(quest_label, original)
