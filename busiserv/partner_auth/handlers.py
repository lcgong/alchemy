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
            self.set_cookie(PRINCIPAL_TOKEN, None)
            return

        secure = self._get_principal_secure()
        assert secure, 'no princial secure'

        token = jwt.encode(principal_dict, self._get_principal_secure(),
                            algorithm='HS256')
        self.set_cookie(PRINCIPAL_TOKEN, token, expires_days=30, httponly=True)

    def get_signed_crsf(self):
        token = self.get_cookie('_crsf_signed', None)
        if not token: return

        data = jwt.decode(token, self._get_principal_secure(),
                                algorithms=['HS256'])
        return data

    def clear_crsf(self):
        self.clear_cookie('_crsf_signed')
        self.clear_cookie('_crsf_token')

    def generate_crsf(self, value):
        """"""
        pass
  # let crsf = crypto.randomBytes(12).toString('base64');
  # let salt = crypto.randomBytes(3).toString('base64');
  # let data = {crsf: crsf, salt: salt, ts: moment().unix()};
  # let signed = jwt.sign(data, get_jwt_secure(), {expiresIn:'1d'});
  #
  # let expires = new Date(Date.now() + 24*3600*1000);
  #
  # // script can access the unsigned version
  # res.cookie('_crsf_token', crsf, { expires: expires });
  #
  # // script cannot access this signed cookie.
  # res.cookie('_crsf_singed', signed, { expires: expires, httpOnly: true });
        # if value == None:
        #     self.set_cookie('_crsf_signed', None)
        #     return
        #
        # secure = self._get_principal_secure()
        # assert secure, 'no princial secure'
        #
        # token = jwt.encode(principal_dict, self._get_principal_secure(),
        #                     algorithm='HS256')
        # self.set_cookie(PRINCIPAL_TOKEN, token, expires_days=30, httponly=True)


from tornado.web import HTTPError

class OAuthHandler(tornado.web.RequestHandler, AuthenticationHandler):
    async def get(self, servid):
        auth_code  = self.get_argument('code', None)
        state = self.get_argument('state', None)

        if not auth_code:
            raise HTTPError(403, reason='Invalid Authorization Code')

        crsf = self.get_signed_crsf()
        if not crsf or not state:
            raise HTTPError(403, reason='No CRSF Protection Code')

        if crsf['crsf'] != state:
            raise HTTPError(403, reason='Mismatched CRSF Protection Code')

        print(crsf, state)

        client = get_oauth_client(servid)
        if not client:
            raise HTTPError(404, reason=f'No Such \'{servid}\' OAuth Client')

        self.clear_crsf() # CRSF完成历史使命，清除

        user = await client.singin(auth_code=auth_code)

        # 数据库没有找到，可能是新用户
        self.principal = dict(potential = user)
        self.redirect('/signup')
