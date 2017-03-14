

from base64 import b64encode, b64decode
from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from Crypto.Signature import PKCS1_v1_5

from datetime import datetime
import aiohttp
import json

class AlipayClient:
    def __init__(self, app_id, app_key, alipay_key, gateway_url):

        self.app_id = app_id
        self.signer = RSA2Signer(app_key)
        self.verifier = RSA2Signer(alipay_key)
        self.gateway_url = gateway_url

    def open_session(self, **kwargs):
        return AlipaySession(self, **kwargs)


class AlipaySession:

    def __init__(self, alipay_client, **kwargs):
        self._alipay_app = alipay_client
        self._http_kwargs = kwargs
        self._http_client = aiohttp.ClientSession(**self._http_kwargs)


    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self._http_client.close()

    async def request(self, method, **kwargs) :

        alipay_app = self._alipay_app

        params = {
            'method': method,
            'app_id': alipay_app.app_id,
            'sign_type': 'RSA2',
            'charset':'UTF-8',
            'version': '1.0',
            'timestamp' : datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
        params.update(kwargs)

        biz_content = params.get('biz_content')
        if isinstance(biz_content, dict):
            params['biz_content'] = _json_string(biz_content)

        params['sign'] =  alipay_app.signer.sign(_signing_text(params))


        # timeout is required for tornado
        async with self._http_client.request('POST', alipay_app.gateway_url,
                                             data=params, timeout=None) as resp :
            assert resp.status == 200
            resp_text = await resp.text()

        assert resp_text

        json_obj  = json.loads(resp_text)

        resp_key = 'error_response'
        if resp_key in json_obj:
            self.verify_response(json_obj, resp_key, resp.charset);
            raise ValueError(json_obj[resp_key]['sub_msg'])

        resp_key = method.replace('.', '_') + '_response'
        if resp_key in json_obj:
            resp_obj = json_obj[resp_key]
            self.verify_response(json_obj, resp_key, resp.charset);
            return resp_obj

    def verify_response(self, json_obj, resp_key, encoding='GBK'):
        # 检验签名
        #所有参数，不包括字节类型参数，如文件、字节流，剔除sign字段。
        #参数排列按字母升序，参数以“参数=参数值”进行格式，并使用&将各参数拼接起来。
        #按照RSA-SHA256签名，以Base64编码。
        #https://doc.open.alipay.com/docs/doc.htm?articleId=104105&docType=1

        signature = json_obj['sign']
        resp_data = _json_string(json_obj[resp_key]).encode(encoding)

        if not self._alipay_app.verifier.verify(resp_data, signature):
            raise ValueError('数据完整性检失败')

    async def auth(self, code):
        method = 'alipay.system.oauth.token'
        # 'alipay.open.auth.token.app'
        return await self.request(method, biz_content = {
                    'grant_type': 'authorization_code',
                    'code': code
                }, grant_type='authorization_code', code=code)

    async def get_userinfo(self, auth_token):
        return await self.request('alipay.user.userinfo.share',
                                    auth_token=auth_token)

def _json_string(obj):
    return json.dumps(obj, separators=(',', ':'), ensure_ascii=False, sort_keys=True)

def _signing_text(params):
    segments = []
    for k in sorted(params.keys()):
        if k == 'sign': continue
        segments.append(k +'=' + params[k])

    return '&'.join(segments)


class RSA2Signer:
    """ RSA-SHA256 """

    def __init__(self, secret):
        try:
            rsa_key = RSA.importKey(secret)
            self._rsa = PKCS1_v1_5.new(rsa_key)
        except ValueError:
            raise HttpSigException("Invalid key.")

    def sign(self, data):
        if isinstance(data, str):
            data = data.encode("utf-8")

        h = SHA256.new()
        h.update(data)
        return b64encode(self._rsa.sign(h)).decode('utf-8')

    def verify(self, data, signature):

        if isinstance(data, str):
            data = data.encode("utf-8")

        if isinstance(signature, str):
            signature = signature.encode("utf-8")

        h = SHA256.new()
        h.update(data)
        return self._rsa.verify(h, b64decode(signature))
