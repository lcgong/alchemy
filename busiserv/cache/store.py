

import aioredis
import asyncio


class BaseCacheStore:
    async def get(self, key, *, default=None):
        """
        Fetch a given key from the cache. If the key does not exist, return
        default, which itself defaults to None.
        """
        raise NotImplementedError('subclasses of BaseCache must provide'
                                  ' an get() method')

    async def set(self, key, value, *, timeout=None):
        """ Set a value in the cache.
        If timeout (in seconds) is given, use that timeout for the key;
        otherwise use the default cache timeout.
        """
        raise NotImplementedError('subclasses of BaseCache must provide'
                                  ' an set() method')


class RedisStore(BaseCacheStore):
    """ A redis backends for cache store.
    """

    def __init__(self, host='localhost', port=6379, loop=None):
        self._pool = None
        self._host = host
        self._port = port

        self._addr = (self._host, self._port)
        self._opts = dict(minsize=1, maxsize=10)

        self._loop = loop if loop is not None else asyncio.get_event_loop()

    async def _get_pool(self):
        "Get the redis connection pool"

        if self._pool is None:
            self._pool = await aioredis.create_pool(self._addr, **self._opts)
            return self._pool

        return self._pool

    async def get(self, key, *, default=None):
        "Fetch a given key from the cache."

        async with (await self._get_pool()).get() as conn:
            value = await conn.get(key)
            if value is None:
                return default

            return value

    async def set(self, key, value, *, timeout=None):
        "Set a value in the cache."

        async with (await self._get_pool()).get() as conn:
            return await conn.set(key, value, expire=timeout)


    def __del__(self):
        if self._pool is not None and not self._pool.closed:
            self._pool.close() # graceful shutdown
            #await self._pool.wait_closed()
