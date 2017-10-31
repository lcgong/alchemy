# -*- coding: utf-8 -*-

from datetime import datetime
import aiohttp
import asyncio
import json
import yaml

from .exceptions import InvalidAuthorization, AccessDenied
from .user import OAuthUser

class JDClient:
    def __init__(self, app_id, app_secret, redirect_uri):
        self.app_id = app_id
        self.app_secret = app_secret
        self.redirect_uri = redirect_uri

    def open_session(self, **kwargs):
        return JDSession(self, **kwargs)

    async def singin(self, auth_code):
        """  """

        async with self.open_session() as weibo:
            resp = await weibo.get_access_token(code = auth_code)
            access_token  = resp['access_token']
            refresh_token = resp['refresh_token']

            user_id = resp['uid']
            name    = resp['user_nick']
            expires_in = resp['expires_in'] # 失效时间（从当前时间算起，单位：秒）
            time = resp['time'] # 授权的时间点（UNIX时间戳，单位：毫秒）
            expires_in = int(time)/1000 + int(expires_in)

        return dict(access_token = access_token,
                    refresh_token = refresh_token,
                    user_id = user_id,
                    title = None,
                    name = name,
                    avatar_url = None,
                    description = None,
                    email = None)

class JDSession:

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
        url = 'https://oauth.jd.com/oauth/token'
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
