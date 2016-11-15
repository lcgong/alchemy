# -*- coding: utf-8 -*-



import re
from datetime import datetime
from domainics.db import dbc, transaction, dmerge, drecall
from domainics.tornice import route_base, rest, webreq
from domainics import busilogic
from domainics.domobj import dset, dobject, datt, DSet, DPage

from schema.user import sys_user, sys_user_seqno

route_base('/api/repos/')


from serv.user import get_user, current_user

from schema.repos import ts_repos, ts_repos_seqno, ts_repos_user

from schema.repos import ts_repos_queststyles
from schema.repos import ts_repos_tags
from schema.repos import ts_repos_categories

from schema.label import ts_label, ts_label_seqno

import json


@rest.GET(r'{repos_sn:int}/queststyles')
@transaction
def get_repos_queststyles(repos_sn):
    """  """

    dbc << """\
    WITH s AS (
      SELECT UNNEST(labels) AS label_sn
      FROM ts_repos_queststyles WHERE repos_sn = %(repos_sn)s
    )
    SELECT label, label_sn, props, created_ts, updated_ts
    FROM ts_label JOIN s USING(label_sn)
    """
    dbc << dict(repos_sn=repos_sn)

    data = {}
    for r in dbc:
        props = r.props if r.props else {}
        props['label_sn'] = r.label_sn
        props['created_ts'] = r.created_ts
        props['updated_ts'] = r.updated_ts

        data[r.label] = props

    return data


@rest.GET(r'{repos_sn:int}/tags')
@transaction
def get_repos_tags(repos_sn):
    """  """

    dbc << """\
    WITH s AS (
      SELECT UNNEST(labels) AS label_sn
      FROM ts_repos_tags WHERE repos_sn = %(repos_sn)s
    )
    SELECT label, label_sn, props, created_ts, updated_ts
    FROM ts_label JOIN s USING(label_sn)
    """
    dbc << dict(repos_sn=repos_sn)

    data = {}
    for r in dbc:
        props = r.props if r.props else {}
        props['label_sn'] = r.label_sn
        props['created_ts'] = r.created_ts
        props['updated_ts'] = r.updated_ts

        data[r.label] = props

    return data

@rest.GET(r'{repos_sn:int}/categories')
@transaction
def get_repos_categories(repos_sn):
    """  """

    dbc << """\
    WITH s AS (
      SELECT UNNEST(labels) AS label_sn
      FROM ts_repos_categories WHERE repos_sn = %(repos_sn)s
    )
    SELECT label, label_sn, props, created_ts, updated_ts
    FROM ts_label JOIN s USING(label_sn)
    """
    dbc << dict(repos_sn=repos_sn)

    data = {}
    for r in dbc:
        props = r.props if r.props else {}
        props['label_sn'] = r.label_sn
        props['created_ts'] = r.created_ts
        props['updated_ts'] = r.updated_ts

        data[r.label] = props

    return data

@rest.POST(r'{repos_sn:int}/queststyles')
@transaction
def add_queststyles(repos_sn, json_arg):
    """  """

    now = datetime.utcnow();

    text = json_arg['text'];
    label_texts = re.split('\s*[;,，;/.。、\s]+\s*', text)

    labels = get_update_labels(repos_sn, label_texts, label_type="S")

    new_set = set(labels.values())

    orig_queststyles = drecall(ts_repos_queststyles(repos_sn=repos_sn))
    if orig_queststyles:
        old_set = set(orig_queststyles.labels)
        if old_set == new_set:
            return

        new_set = new_set.union(old_set)

    queststyles = ts_repos_queststyles(repos_sn=repos_sn)
    queststyles.labels = sorted(int(x) for x in new_set)
    queststyles.updated_ts = now

    dmerge(queststyles, orig_queststyles)

    return



@rest.POST(r'{repos_sn:int}/tags')
@transaction
def add_tags(repos_sn, json_arg):
    """  """

    now = datetime.utcnow();
    label_texts = re.split('\s*[;,，;/.。、\s]+\s*', json_arg['text'])

    labels = get_update_labels(repos_sn, label_texts, label_type="T")

    new_set = set(labels.values())

    orig_tags = drecall(ts_repos_tags(repos_sn=repos_sn))
    if orig_tags:
        old_set = set(orig_tags.labels)
        if old_set == new_set:
            return

        new_set = new_set.union(old_set)

    tags = ts_repos_tags(repos_sn=repos_sn)
    tags.labels = sorted(int(x) for x in new_set)
    tags.updated_ts = now

    dmerge(tags, orig_tags)

    return

def get_update_labels(repos_sn, label_texts, label_type):

    label_texts = list(set(label_texts))

    now = datetime.utcnow();

    dbc << """
    SELECT label_sn, label FROM ts_label
    WHERE repos_sn = %(repos_sn)s
          AND type = %(label_type)s
          AND label = ANY (%(labels)s)
    """
    dbc << dict(repos_sn=repos_sn, labels=label_texts, label_type=label_type)
    found_labels = { x.label: x.label_sn for x in dbc }

    LabelSet = dset(ts_label)

    new_labels = LabelSet()
    for text in label_texts:
        if text in found_labels:
            continue

        label = ts_label(repos_sn=repos_sn, label_sn=ts_label_seqno())
        label.label=text
        label.type = label_type
        label.created_ts = now
        label.updated_ts = now

        new_labels._add(label)

    dmerge(new_labels)

    for item in new_labels:
        found_labels[item.label] = item.label_sn

    return found_labels





@rest.DELETE('{repos_sn:int}/queststyles/{label_sn:int}')
@transaction
def delete_repos_queststyles(repos_sn: int, label_sn:int):
    """  """

    now = datetime.utcnow();

    orig_queststyles = drecall(ts_repos_queststyles(repos_sn=repos_sn))

    queststyles = ts_repos_queststyles(orig_queststyles)
    queststyles.labels = [] + queststyles.labels
    try:
        pos = queststyles.labels.index(label_sn)
    except:
        return

    del queststyles.labels[pos]

    queststyles.updated_ts = now

    dmerge(queststyles, orig_queststyles)

    return


@rest.DELETE('{repos_sn:int}/tags/{label_sn:int}')
@transaction
def delete_repos_tags(repos_sn: int, label_sn:int):
    """  """

    now = datetime.utcnow();

    orig_tags = drecall(ts_repos_tags(repos_sn=repos_sn))

    tags = ts_repos_tags(orig_tags)
    tags.labels = [] + tags.labels
    try:
        pos = tags.labels.index(label_sn)
    except:
        return

    del tags.labels[pos]

    tags.updated_ts = now

    dmerge(tags, orig_tags)


import copy

@rest.POST(r'{repos_sn:int}/categories')
@transaction
def update_category(repos_sn, json_arg):
    """  """

    now = datetime.utcnow();

    text = json_arg['text'];

    print(repos_sn, text)

    labels = []
    level_1 = ''
    for ln in re.split('[\n\r]+', text):
        m = re.search('(^\s+)', ln)
        sp_num = m.end() if m else 0

        if sp_num > 0:
            labels.append(level_1 + '/' + ln.strip())
        else:
            level_1 = ln.strip()
            labels.append(level_1)


    old_labels = get_repos_categories(repos_sn)

    old_set = set(old_labels.keys())
    new_set = set(labels)

    lbl_com_set = old_set.intersection(new_set)
    lbl_ins_set = new_set.difference(lbl_com_set)


    new_labels = get_update_labels(repos_sn, lbl_ins_set, 'C')

    sn_com_list = set(old_labels[n]['label_sn'] for n in lbl_com_set)
    sn_ins_list = set(int(new_labels[n]) for n in lbl_ins_set)


    orig_categories = drecall(ts_repos_categories(repos_sn=repos_sn))



    categories = ts_repos_categories(repos_sn=repos_sn)
    categories.labels = sorted(int(x) for x in sn_ins_list.union(sn_com_list))
    categories.updated_ts = now

    dmerge(categories, orig_categories)

    ##-----------------------------------------------------------------------
    ## 保留文本指定的顺序

    orders = {}
    for i, lbl in enumerate(labels):
        orders[lbl] = i + 1

    dbc << """\
    WITH s AS (
      SELECT UNNEST(labels) AS label_sn
      FROM ts_repos_categories WHERE repos_sn = %(repos_sn)s
    )
    SELECT t.*
    FROM ts_label t JOIN s USING(label_sn)
    """
    dbc << dict(repos_sn=repos_sn)

    LabelSet = dset(ts_label)

    old_label_set = LabelSet(dbc)

    label_set = LabelSet()
    for r in old_label_set:
        r = ts_label(r)
        r.props = copy.deepcopy(r.props) # 需要复制，否则修改的是旧的
        label_set._add(r)

    for r in label_set:
        ordnum = orders[r.label]
        if r.props:
            if 'order' in r.props and r.props['order'] == ordnum:
                continue

            r.props['order'] = ordnum
        else:
            pass
            r.props = {'order': ordnum}
        r.updated_ts = now

    dmerge(label_set, old_label_set)
