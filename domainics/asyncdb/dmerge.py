# -*- coding: utf-8 -*-

import datetime
import json

from decimal import Decimal
from collections import OrderedDict, namedtuple
from collections.abc import Iterable
from itertools import chain as iter_chain

from ..domobj import dset, DSetBase, dobject, reshape
from .dtable import json_object, dtable, dsequence

from .sqlblock import dbc

_EntryTuple = namedtuple('EntryTuple', ['pkey_attrs', 'pkey_values',
                                        'attrs',  'values'])

def _dtable_diff(current, past):
    """diff dtable object, return the delta information.

    The delta information is a tuple, the data is added, changged and removed.
    """

    inslst = [] # [obj] the objects to be inserted
    dellst = [] # [objid] the objid to be deleted
    chglst = [] # [{attr: (current, past)}],  modified

    item_type = current.__dset_item_class__
    pkey_attrs = item_type.__dobject_key__
    value_attrs = item_type.__dobject_att__
    for curr_obj in current:
        if curr_obj not in past:
            inslst.append(curr_obj)
            continue

        past_obj = past[curr_obj]

        modified = OrderedDict()
        for attr_name in value_attrs:
            if not hasattr(past_obj, attr_name):
                continue

            newval = getattr(curr_obj, attr_name)
            oldval = getattr(past_obj, attr_name)
            if newval == oldval:
                continue

            modified[attr_name] = (newval, oldval)

        if modified:
            chglst.append((curr_obj.__dobject_key__, modified))

    for past_obj in past:
        if past_obj not in current:
            dellst.append(past_obj)

    # inserted data tuple
    pkvals, values = [], []
    for obj in inslst: # objects to be inserted
        pkvals.append(tuple(getattr(obj, f) for f in pkey_attrs))

        attr_values = []
        for attr_name, attr in value_attrs.items():
            attr_value = getattr(obj, attr_name)

            if (issubclass(attr.type, json_object)
                    and not isinstance(attr_value, str)):  # json cast
                attr_value = json.dumps(attr_value)

            attr_values.append(attr_value)

        values.append(tuple(attr_values))

    dt_ins = _EntryTuple(pkey_attrs, pkvals, value_attrs, values)

    # deleted data tuple
    item_type = past.__dset_item_class__
    pkvals = []
    for obj in dellst:
        pkvals.append(tuple(getattr(obj, f) for f in pkey_attrs))

    dt_del = _EntryTuple(pkey_attrs, pkvals, None,  None)

    # modified data tuple

    pkvals = []
    values = []
    for objid, modified in chglst:
        pkvals.append(tuple(getattr(objid, f) for f in pkey_attrs))
        values.append(modified)

    dt_chg = _EntryTuple(pkey_attrs, pkvals,  value_attrs, values)

    return dt_ins, dt_chg, dt_del

def pq_dtable_merge(current, past):

    dins, dchg, ddel = _dtable_diff(current, past)
    table_name = current.__dset_item_class__.__name__

    dobj_cls = current.__dset_item_class__
    attrs = OrderedDict((attr_name, attr) for attr_name, attr in
                        iter_chain(dobj_cls.__dobject_key__.items(),
                                   dobj_cls.__dobject_att__.items()))

    seq_attrs = {}
    for n, attr in attrs.items():
        if issubclass(attr.type, dsequence):
            seq_attrs[n] = attr


    if dins.values:
        cols = tuple(iter_chain(dins.pkey_attrs.keys(), dins.attrs.keys()))
        values = [k + v for k, v in zip(dins.pkey_values, dins.values)]

        # If there are new sequence objects,
        # get next values of them in a batch
        if seq_attrs:
            seq_cols = [] # (col_idx, col_name, [seq_value])
            for i, colname in enumerate(cols):
                if colname in seq_attrs:
                    seq_cols.append((i, colname, []))

            for record in values:
                for seq_col in seq_cols:
                    seq_val = record[seq_col[0]]
                    if seq_val is not None:
                        seq_col[2].append(seq_val)

            for colidx, colname, seqvals in seq_cols:
                allocate_sequence(seq_attrs[colname], seqvals)

        sql = """
        INSERT INTO {table} ({cols})
        VALUES ({vals});
        """.format(table=table_name,
                   cols=', '.join(cols),
                   vals=', '.join(['%s'] * len(cols)))

        dbc << sql
        dbc << values


    if dchg.values:

        if seq_attrs:
            # for attrname in dchg.values.items():

            seq_cols = {}
            for record in dchg.values:
                for colname in record:
                    if colname in seq_attrs:
                        try:
                            seqvals = seq_cols[colname]
                        except KeyError:
                            seq_cols[colname] = seqvals = []

                        seqvals.append(record[colname][0])

            for colname, seqvals in seq_cols.items():
                allocate_sequence(seq_attrs[colname], seqvals)

        # generate update statment in a modified field group
        groups = {}
        for i, modified in enumerate(dchg.values): # group with attr name
            grpid = tuple(modified.keys())
            try:
                chgidxs = groups[grpid]
            except KeyError:
                groups[grpid] = chgidxs = []

            chgidxs.append(i)

        pkcond = ' AND '.join(['{pk}=%s'.format(pk=pk)
                                    for pk in dchg.pkey_attrs])
        for grpid, chgidxs in groups.items():
            asgn_expr = ', '.join(['%s=%%s' % name for name in grpid])

            dbc << """
            UPDATE {table} SET
            {asgn}
            WHERE {pkcond}
            """.format(table=table_name, asgn=asgn_expr, pkcond=pkcond)

            for i in chgidxs:
                values = tuple(dchg.values[i][k][0] for k in grpid)
                pkvals = dchg.pkey_values[i]
                dbc << values + pkvals

    if ddel.pkey_values:
        pkcond = ' AND '.join(['{pk}=%s'.format(pk=pk)
                                    for pk in ddel.pkey_attrs])

        dbc << """
        DELETE FROM {table} WHERE {pkcond};
        """.format(table=table_name, pkcond=pkcond)

        dbc << [k for k in ddel.pkey_values]


def allocate_sequence(attr, seq_values):
    pending = [i for i, s in enumerate(seq_values) if not s.allocated]
    if not pending:
        return

    # nextval of sequence
    seqname = attr.type.__name__
    newvals = dbc.nextval(seqname, batch_cnt=len(pending))

    for idx, value in zip(pending, newvals):
        seq_values[idx].value = value

def dmerge(current, origin=None):

    """
    Merge the current change of object into the origin.

    """
    if current is None and origin is None:
        return

    if current is not None and not isinstance(current, DSetBase):
        if not isinstance(current, dobject):
            err = 'The current object should be dobject or dset type: %s'
            err %= current.__class__.__name__
            raise TypeError(err)

        dos = dset(current.__class__)()
        dos._add(current)
        current = dos

    if origin is not None and not isinstance(origin, DSetBase):
        if not isinstance(origin, dobject):
            err = 'The origin object should be dobject or dset type: %s'
            err %= origin.__class__.__name__
            raise TypeError(err)

        dos = dset(origin.__class__)()
        if origin:
            dos._add(origin)

        origin = dos

    if current is None:
        current = origin.__class__()

    if origin is None:
        origin = current.__class__()

    if dbc.dbms == 'postgres':
        pq_dtable_merge(current, origin)
