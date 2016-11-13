# -*- coding: utf-8 -*-


from datetime import datetime
from domainics.db import dbc, transaction, dmerge, drecall
from domainics.tornice import route_base, rest, webreq
from domainics import busilogic
from domainics.domobj import dset, dobject, datt, DSet, DPage

from schema.user import sys_user, sys_user_seqno

route_base('/api/sys/')

def current_user():
    user_sn = webreq.principal_id
    user = get_user(user_sn)
    if user:
        return user

    busilogic.unauthorized()

def assert_roles(*roles):
    user = current_user()
    print(user, user.sys_roles, roles)
    for role in roles:
        if role in user.sys_roles:
            return True

    busilogic.forbidden("需要角色: " + ', '.join(roles))

class UserInfo(dobject):
    user_sn    = datt(int, doc='用户标识序号')
    user_name  = datt(str, doc='用户名')

    state      = datt(str, doc="""
                    用户状态:
                    normal - 正常,
                    suspended - 暂时封号
                    closed - 已销户""")

    extras     = datt(object, doc='其它信息用户描述信息')
    notes      = datt(str, doc='备注')


    login_id   = datt(str, doc='用户登录标识')
    sys_roles  = datt(list, doc='系统角色')

    created    = datt(datetime, doc='用户创建时间')
    passwd_upd = datt(datetime, doc='密码更新时间')

    __dobject_key__ = [user_sn]


class UserPassword(dobject):
    """用户(设置)密码"""
    user_sn     = datt(int, doc='')
    passwd      = datt(str, doc='')
    passwd_upd  = datt(datetime, doc='')

UserInfo = sys_user._re(_ignore=['passwd'])
PasswordForm = sys_user._re('user_sn', 'passwd', 'passwd_upd')


# 用户可以读, 但要限制用户写入信息
NewUserForm = sys_user._re(_ignore=['passwd_upd', 'passwd'])


@rest.GET(r'user/')
@transaction
def list_user(page: DPage) -> DSet[UserInfo]:
    """取得用户信息"""

    UserSet = dset(UserInfo)
    users = drecall(UserSet(_page=page))
    return users


@rest.GET(r'user/me')
@transaction
def get_me(user_sn: int) -> UserInfo:
    """取得用户信息"""

    user_sn = webreq.principal_id
    if user_sn is None:
        busilogic.unauthorized("当前用户未验证身份")

    return get_user(user_sn)


@rest.GET(r'user/{user_sn:int}')
@transaction
def get_user(user_sn: int) -> UserInfo:
    """取得用户信息"""

    # if user_sn == 'me' :
    #     user_sn = webreq.principal_id
    #     if user_sn is None:
    #         busilogic.unauthorized("当前用户未验证身份")

    return drecall(UserInfo(user_sn=user_sn))


@rest.POST('user/')
@transaction
def create_user(user : NewUserForm) -> UserInfo:
    """创建用户"""

    assert_roles('sysadmin')

    return _create_user(user)

@transaction
def _create_user(user : NewUserForm) -> UserInfo:
    """创建用户"""

    sys_roles = ['sysuser']
    if user.sys_roles:
        sys_roles += user.sys_roles

    user = NewUserForm(user,
                       user_sn = sys_user_seqno(),
                       created = datetime.now(),
                       state = 'normal',
                       sys_roles = sys_roles)

    dbc << "SELECT user_sn FROM sys_user WHERE login_id=%(login_id)s"
    dbc << dict(login_id=user.login_id)
    used = next(dbc)
    if used:
        err = '登录ID(%s)已经被(%d)使用' % (user.login_id, used.user_sn)
        busilogic.fail(err)

    dmerge(user)

    return get_user(user.user_sn)

UserForm = sys_user._re(_ignore=['passwd', 'passwd_upd', 'created'])

@rest.PUT(r'user/{user_sn:int}')
@transaction
def save_user(user: UserForm):
    """"""

    assert_roles('sysadmin')

    user.sys_roles = list(sorted(set(user.sys_roles)))
    # print(user.sys_roles)

    dmerge(user, drecall(user))


@rest.DELETE(r'user/{user_sn:int}')
@transaction
def delete_user(user_sn:int):
    """  """

    assert_roles('sysadmin')

    dbc << """
    DELETE FROM sys_user WHERE user_sn = %(user_sn)s
    """
    dbc << dict(user_sn=user_sn)


@rest.POST('user/passwd/(?:{user_sn:int}|current)')
@transaction
def set_password(passwd: PasswordForm):
    """设置密码"""

    user = current_user()
    if passwd.user_sn != user.user_sn:
        assert_roles('sysadmin')


    return _set_password(passwd)


@transaction
def _set_password(passwd: PasswordForm):
    """设置密码"""

    passwd.passwd = hash_passwd(passwd.passwd)
    passwd.passwd_upd = datetime.now()

    dmerge(passwd, origin = drecall(passwd))



class LoginForm(dobject):
    __table_name__ = 'sys_user'

    login_id = datt(str)
    user_sn  = datt(int, doc='')
    passwd   = datt(str)

    __dobject_key__ = [login_id]

@rest.POST('/api/login')
@transaction
def login(login: LoginForm):

    if not login.login_id :
        busilogic.unauthorized("登录ID不能为空")

    login_id  = login.login_id
    passwd = login.passwd

    login = drecall(login)
    if not login :
        busilogic.unauthorized("无效登录ID:'%s'" % login_id)

    if not check_password(passwd, login.passwd) :
        busilogic.unauthorized("登录ID(%s)密码验证失败" % login_id)

    webreq.principal_id = str(login.user_sn)

    user = get_user(login.user_sn)
    busilogic.logger.info('User %s logged in' % user.user_name)
    return user

@rest.POST('/api/logout')
@transaction
def logout():

    user_sn = webreq.principal_id
    if not user_sn :
        return

    user_sn = int(user_sn)

    busilogic.logger.info('用户(%d)登出系统' % user_sn)
    webreq.principal_id = None



import os
import base64
import hashlib

def check_password(passwd, saved_passwd):
    """与加盐保存的密码比较是否来自同一个密码"""

    if saved_passwd is None:
        return False

    salt = saved_passwd[:8].encode()
    return hash_passwd(passwd, salt) == saved_passwd

def hash_passwd(passwd, salt=None):
    """密码加盐"""

    if salt is None:
        salt = base64.b16encode(os.urandom(4))
    else:
        assert len(salt) == 8, '8-length salt'

    hashed = passwd.encode()
    hashed = salt + base64.b16encode(hashlib.sha1(hashed).digest())
    hashed = salt + base64.b16encode(hashlib.sha1(hashed).digest())
    hashed = hashed.decode('UTF-8')

    return hashed
