
import asyncio
from store import RedisStore

async def go():

    store = RedisStore()
    value = await store.get('x')
    print(value)

    await store.set('s', 123)

    value = await store.get('s')
    print(value)


def main():
    "The main entrance"

    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(go())
    finally:
        loop.run_until_complete(asyncio.gather(loop.shutdown_asyncgens(),
                                               *asyncio.Task.all_tasks()))
        loop.close()

if __name__ == '__main__':
    main()
