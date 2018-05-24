import asyncio
import pytest


from redbean.asyncid import AsyncID64

endpoint = "127.0.0.1:2379"


from random import uniform as rand_uniform


# @pytest.mark.asyncio
# async def test_some_asyncio_code(event_loop):
#     print(123, event_loop)

#     user_sn_gen = AsyncID(endpoint, 'user_sn')

#     async def func(id, seqnum):
#         while True:
#             user_sn = await seqnum.new() # 64-bits integer
#             print(f'new#{id}: ', base16(user_sn), user_sn)
#             await asyncio.sleep(rand_uniform(0.3, 1))


#     event_loop.create_task(func(0, user_sn_gen))
#     await asyncio.sleep(30)

#     user_sn_gen.close()
    
#     # res = await library.do_something()
#     # assert b'expected result' == res


if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(levelname)s %(message)s')

    async def func(id, seqno):
        while True:
            print(f'new#{id}: ', await seqno.new())
            print(f'new#{id}: ', await seqno.new(encoding='base16'))

            await asyncio.sleep(rand_uniform(0.3, 1))

    loop = asyncio.get_event_loop()

    user_sn_gen1 = AsyncID64(endpoint, 'user_sn', max_sequence=12)
    user_sn_gen2 = AsyncID64(endpoint, 'user_sn', max_sequence=12)

    tasks = [
        loop.create_task(func(0, user_sn_gen1)),
        loop.create_task(func(1, user_sn_gen1)),
        loop.create_task(func(2, user_sn_gen2)),
        loop.create_task(func(3, user_sn_gen2)),
    ]

    async def empty():
        pass


    try:
        loop.run_forever()
    except KeyboardInterrupt:
        for task in asyncio.Task.all_tasks():
            task.cancel()
        
    finally:
        loop.run_until_complete(asyncio.wait(asyncio.Task.all_tasks()))            


        loop.close()