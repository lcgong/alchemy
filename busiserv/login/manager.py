# -*- coding: utf-8 -*-

import yaml

_oauth_clients = {

}

def _get_oauth_config(servid):
    with open('../secrets/oauth.yml', 'r') as f:
        return yaml.load(f).get(servid)


def get_oauth_client(servid):
    client = _oauth_clients.get(servid)
    if client: return client

    if servid == 'weibo':
        from .weibo import WeiboClient

        config = _get_oauth_config(servid)
        client = WeiboClient(app_id = config['app_id'],
                             app_secret = config['app_secret'],
                             redirect_uri = config['redirect_uri'])

    elif servid == 'baidu':
        from .baidu import BaiduClient

        config = _get_oauth_config(servid)
        client = BaiduClient(app_id = config['app_id'],
                             app_secret = config['app_secret'],
                             redirect_uri = config['redirect_uri'])
    else:
        raise ValueError(f'Unknow oauth service: {servid}')

    _oauth_clients[servid] = client

    return client


# >>> from jose import jwt
# >>> token = jwt.encode({'key': 'value'}, 'secret', algorithm='HS256')
# u'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ2YWx1ZSJ9.FG-8UppwHaFp1LgRYQQeS6EDQF7_6-bMFegNucHjmWg'
#
# >>> jwt.decode(token, 'secret', algorithms=['HS256'])
# {u'key': u'value'}
