# -*- coding: utf-8 -*-

from datetime import datetime
import aiohttp
import asyncio
import json
import yaml

from .exceptions import InvalidAuthorization, AccessDenied
from .user import OAuthUser

class WeiboClient:
    def __init__(self, app_id, app_secret, redirect_uri):
        self.app_id = app_id
        self.app_secret = app_secret
        self.redirect_uri = redirect_uri

    def open_session(self, **kwargs):
        return WeiboSession(self, **kwargs)

    async def singin(self, auth_code):
        """ 使用新浪微博登录 """

        async with self.open_session() as weibo:
            resp = await weibo.get_access_token(code = auth_code)
            access_token = resp['access_token']
            user_id = resp['uid']

            resp = await weibo.get_user_show(access_token = access_token,
                                             user_id = user_id)
            try:
                email = await weibo.get_user_email(access_token = access_token)
            except AccessDenied as exc:
                email = None
                print('WARN: access denied, ' + str(exc))

        return dict(access_token = access_token,
                    user_id = user_id,
                    title = resp['screen_name'],
                    name = resp['name'],
                    avatar_url = resp['profile_image_url'],
                    description = resp['description'],
                    email = email)

class WeiboSession:

    def __init__(self, client, **kwargs):
        self._client = client
        self._http_session = aiohttp.ClientSession(**kwargs)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self._http_session.close()

    async def get_access_token(self, code):
        """

        {access_token: , uid: }
        """
        url = 'https://api.weibo.com/oauth2/access_token'
        data = dict(client_id=self._client.app_id,
                    client_secret=self._client.app_secret,
                    grant_type='authorization_code',
                    code=code,
                    redirect_uri=self._client.redirect_uri)

        async with self._http_session.post(url, data=data, timeout=None) as resp:
            resp_text = await resp.text()

            if resp.status >= 400:
                print('ERROR: ', resp_text)
                resp_json = json.loads(resp_text)
                raise InvalidAuthorization(resp_json['error_description'])

            return json.loads(resp_text)

    async def get_user_show(self, access_token, user_id):
        """
        获取用户可显示的信息

        http://open.weibo.com/wiki/2/users/show
        """

        url = 'https://api.weibo.com/2/users/show.json'
        data = dict(access_token=access_token, uid=user_id)
        async with self._http_session.get(url, params=data, timeout=None) as resp:
            resp_json = await resp.json()
            return resp_json

    async def get_user_email(self, access_token=None):
        """ 该信息需要申请
        http://open.weibo.com/wiki/2/account/profile/email
        """

        url = 'https://api.weibo.com/2/account/profile/email.json'
        data = dict(access_token=access_token)
        async with self._http_session.get(url, params=data, timeout=None) as resp:
            resp_text = await resp.text()
            if resp.status == 403:
                resp_json = json.loads(resp_text)
                raise AccessDenied(f"url: \'{resp_json['request']}\'")

            print(resp.status,  resp_json)
            return resp_json[0]['email']




async def main():

    loop = asyncio.get_event_loop()
    async with weibo_client.open_session() as weibo:
        # resp = await weibo.get_access_token(code='03c1c1eda4a8f27914636e12cf451d3a')
        # access_token = resp['access_token']
        # user_id = resp['uid']
        #
        # access_token = resp['access_token']
        # user_id = resp['uid']

        # print(f'{user_id} {access_token}')

        access_token = '2.00jQDnYD4VvRLD9b3844da577tFhsB'
        user_id = 3262484561

        resp = await weibo.get_user_show(access_token=access_token, user_id=user_id)
        print(resp)
        user_title = resp['screen_name']
        user_name = resp['name']
        avatar_url = resp['profile_image_url']
        description = resp['description']

        # email = await weibo.get_user_email(access_token=access_token)

        print(f'''
        userid: {user_id}, name: {user_name} title: {user_title}
        desc: {description}
        avatar: {avatar_url}
        ''')
