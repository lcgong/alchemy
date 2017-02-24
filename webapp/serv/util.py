# -*- coding: utf-8 -*-

import re

def build_search_sqlcond(searchtext, fields):

    if not searchtext:
        return 'TRUE'

    searchtext = re.sub('[\'\"]', '', searchtext)
    words = re.split('[,;\s]+', searchtext)
    words = [w for w in words if w.strip()]
    regex = "'(" + '|'.join(words) + ")'"

    conds = []
    for field_name in fields:
        conds.append(field_name + ' ~* ' + regex)

    return "(" + ' OR '.join(conds) + ")"
