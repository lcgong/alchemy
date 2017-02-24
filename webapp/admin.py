#! /usr/bin/env python3.5
# -*- coding: utf-8 -*-

import argparse

from domainics.db import set_dsn, dbc, transaction




def command_init(cmd_args):

    from schema.db import create_dbuser, create_database, create_tables

    set_dsn(dsn='postgres', sys='postgres', host='localhost',  database="postgres", user='postgres')
    create_dbuser(username="dbo", password="pass")
    create_database(database='alchemy', username='dbo')
    set_dsn(sys='postgres', host='localhost',  database="alchemy", user='dbo')
    create_tables()
    print('初始化数据库完成',)


@transaction
def command_user(cmd_args):

    from schema.user import sys_user
    from serv.user import _create_user, _set_password, PasswordForm

    if cmd_args.create:
        login_id = cmd_args.create[0]

        dbc << "SELECT user_sn FROM sys_user WHERE login_id=%(login_id)s"
        dbc << dict(login_id=login_id)
        if next(dbc, None):
            print('登记标识(%s)已经使用' % login_id)
            return

        sys_roles = []
        if cmd_args.sysadmin:
            sys_roles.append('sysadmin')

        password = None
        if cmd_args.password:
            password = cmd_args.password[0]

        user = sys_user(login_id = login_id, sys_roles=sys_roles)
        user = _create_user(user)

        passwd = PasswordForm(user_sn=user.user_sn, passwd=password)

        _set_password(passwd)

    if cmd_args.reset:
        login_id = cmd_args.reset[0]
        dbc << "SELECT user_sn FROM sys_user WHERE login_id=%(login_id)s"
        dbc << dict(login_id=login_id)
        row = next(dbc, None)
        if not row:
            print('查无此登录标识(%s)' % login_id)
            return

        password = None
        if cmd_args.password:
            password = cmd_args.password[0]

        passwd = PasswordForm(user_sn=row.user_sn, passwd=password)
        set_password(passwd)

    # sys_user

def main():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title='command', dest='command')
    init_parser = subparsers.add_parser('init')

    model_parser = subparsers.add_parser('model')
    model_parser.add_argument('--update', nargs='+')

    user_parser = subparsers.add_parser('user')


    user_parser.add_argument('--create', nargs=1, metavar=('login_id'))
    user_parser.add_argument('--sysadmin', action='store_true')
    user_parser.add_argument('-p', '--password', nargs=1, metavar=('password'))
    user_parser.add_argument('--reset', nargs=1, metavar=('login_id'))


    args = parser.parse_args()


    import domainics.config
    domainics.config.load()

    if args.command == 'init':
        command_init(args)
    elif args.command == 'user':
        command_user(args)

    #
    # cmdline = argparse.ArgumentParser(description='System Admin')
    # cmdline.add_argument('init', action=InitDBAction,
    #     help='初始化整个系统')
    #
    # cmdline.add_argument('update', action=UpdateModel,
    #     help='更新模型')
    #
    # cmdline.parse_args()


if __name__ == '__main__':


    main()
