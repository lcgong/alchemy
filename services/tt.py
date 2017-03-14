
import asyncio
from partner_auth import get_oauth_client


async def main():
    # client = get_oauth_client('weibo')
    # user = await client.singin(auth_code='015da68ea3f62ad7233fa028d8086907')
    client = get_oauth_client('baidu')
    user = await client.singin(auth_code='c5157fd2a6944dae85f0615c591e6c85')
    print(user)


loop = asyncio.get_event_loop()
try:
    # loop.run_until_complete(main())
    asyncio.ensure_future(main())

    loop.run_until_complete(asyncio.gather(*asyncio.Task.all_tasks()))
finally:
    loop.close()
