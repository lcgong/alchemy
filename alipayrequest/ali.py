# -*- coding: utf-8 -*-

import yaml
import asyncio
from alipayrequest import AlipayClient

config = yaml.load(open('../secrets/oauth.yml', 'r')).get('alipay')


async def main():

    loop = asyncio.get_event_loop()
    alipay = AlipayClient(gateway_url = config['gateway_url'],
                          app_id = config['app_id'],
                          app_key = config['private_key'],
                          alipay_key = config['alipay_key'])

    async with alipay.open_session(loop=loop) as client:
        # auth = await client.auth(code='7075cf27d49b4954aec9c7f0c5c9OX60')
        # print(auth)
        user = await client.get_userinfo(auth_token='composeB41df001747814a41af8abdf771ab3F60')
        # print(user)
    client._http_client.close()


loop = asyncio.get_event_loop()
try:
    # loop.run_until_complete(main())
    asyncio.ensure_future(main())

    loop.run_until_complete(asyncio.gather(*asyncio.Task.all_tasks()))
finally:
    loop.close()

# loop = asyncio.get_event_loop()
# try:
#     loop.run_until_complete(main())
# finally:
#     loop.close()
