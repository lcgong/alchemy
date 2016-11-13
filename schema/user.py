from datetime import date, datetime
from domainics.db import dsequence, dtable, datt, json_object, array


class sys_user_seqno(dsequence):
    """系统用户序号"""

    start = 10000
    step  = 1

class sys_user(dtable):
    user_sn    = datt(sys_user_seqno, doc='用户标识序号')

    user_name  = datt(str, doc='用户名')

    login_id   = datt(str, doc='用户登录标识')
    sys_roles  = datt(array(str), doc='系统角色')

    passwd     = datt(str, doc="""\
                    加盐的密码哈希值.
                    采用16进制字母表示:前8位为盐,摘要算法为SHA1""")
    passwd_upd = datt(datetime, doc='密码更新时间')



    state      = datt(str, doc="""
                    用户状态:
                    normal - 正常,
                    suspended - 暂时封号
                    closed - 已销户""")

    # notes      = datt(str, doc='备注')
    #
    extras     = datt(json_object, doc='其它信息用户描述信息')

    created    = datt(datetime, doc='创建时间')


    __dobject_key__ = [user_sn]


#
# class sys_props(dtable):
#     """系统参数表"""
#
#     cid   = datt(str, doc="内容标识")
#     props = datt(json_object, doc="JSON参数")
#
#     updated_ts = datt(datetime, doc='更新时间')
#
#
#     __dobject_key__ = [cid]
