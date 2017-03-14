# -*- coding: utf-8 -*-

from datetime import datetime
import aiohttp
import asyncio
import json
import yaml

from .exceptions import InvalidAuthorization, AccessDenied
from .user import OAuthUser

class BaiduClient:
    def __init__(self, app_id, app_secret, redirect_uri):
        self.app_id = app_id
        self.app_secret = app_secret
        self.redirect_uri = redirect_uri

    def open_session(self, **kwargs):
        return _ClientSession(self, **kwargs)

    async def singin(self, auth_code):
        """ 使用新浪微博登录 """

        async with self.open_session() as session:
            resp = await session.get_access_token(code = auth_code)
            access_token = resp['access_token']
            refresh_token =  resp['refresh_token']
            expires_in = resp['expires_in']
            # print(resp)

            resp = await session.get_userinfo(access_token = access_token)
            # print(resp)
            user_id = resp['userid']
            username = resp['username']
            avatar_id = resp['portrait']

        avatar_url = f'http://tb.himg.baidu.com/sys/portrait/item/{avatar_id}'
        return dict(access_token = access_token, user_id = user_id,
                    refresh_token=refresh_token, expires_in=expires_in,
                    name = username, avatar_url = avatar_url)


class _ClientSession:

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
        http://developer.baidu.com/wiki/index.php?title=docs/oauth/authorization
        """
        url = 'https://openapi.baidu.com/oauth/2.0/token'
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
            resp_json = json.loads(resp_text)
            return resp_json

    async def get_userinfo(self, access_token):
        """
        获取用户可显示的信息

        http://developer.baidu.com/wiki/index.php?title=Open_API%E6%96%87%E6%A1%A3/passport/users/getInfo
        """

        url = 'https://openapi.baidu.com/rest/2.0/passport/users/getInfo'
        data = dict(access_token=access_token, format='json')
        async with self._http_session.get(url, params=data, timeout=None) as resp:
            resp_json = await resp.json()
            return resp_json
