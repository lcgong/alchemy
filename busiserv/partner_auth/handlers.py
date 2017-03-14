# -*- coding: utf-8 -*-

import tornado.web
import aiohttp
import yaml
from jose import jwt

from partner_auth import get_oauth_client


PRINCIPAL_TOKEN = '_principal_token'

class AuthenticationHandler(): # as tornado.web.RequestHandler minxins

    def _get_principal_secure(self):
        secure = getattr(AuthenticationHandler, '_principal_secure', None)
        if secure: return secure

        with open('../secrets/session.yml', 'r') as f:
            secure = yaml.load(f).get('secure')

        setattr(AuthenticationHandler, '_principal_secure', secure)
        return secure

    @property
    def principal(self):
        princial = getattr(self, PRINCIPAL_TOKEN, None)
        if princial: return princial

        token = self.get_cookie(PRINCIPAL_TOKEN, None)
        if not token: return

        princial = jwt.decode(token, self._get_principal_secure(),
                                algorithms=['HS256'])
        setattr(self, PRINCIPAL_TOKEN, princial)

        return princial

    @principal.setter
    def principal(self, principal_dict):
        """"""
        if principal_dict == None:
            self.clear_cookie()
            return

        secure = self._get_principal_secure()
        assert secure, 'no princial secure'

        token = jwt.encode(principal_dict, self._get_principal_secure(),
                            algorithm='HS256')
        self.set_cookie(PRINCIPAL_TOKEN, token, expires_days=30)

from tornado.web import HTTPError

class OAuthHandler(tornado.web.RequestHandler, AuthenticationHandler):
    async def get(self, servid):
        auth_code  = self.get_argument('code', None)
        state = self.get_argument('state', None)

        if not auth_code or not state:
            raise HTTPError(403, reason='Invalid Authorization Code')

        client = get_oauth_client(servid)
        if not client:
            raise HTTPError(404, reason=f'No Such \'{servid}\' OAuth Client')

        user = await client.singin(auth_code=auth_code)

        # a potential user
        self.principal = dict(potential = user)
