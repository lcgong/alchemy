
from . import pb
from .lease import Lease
from .utils import ensure_bytes, to_str, with_range

class Client():

    def __init__(self, url):
        self._stub = pb.AsyncStub(url)

        self._default_kwargs = dict() # timeout, credentials, ...
        self._credentials = None
        self._timeout = None

    @property
    def last_response(self):
        return self._stub._last_response

    async def value(self, key, type=to_str):
        """
        """
        kv = await self._stub.get_keyvalue(key)
        if kv is None:
            return None

        return to_str(kv.value)

    async def items(self, prefix, range_end=None, type=to_str):
        """
        """
        async for kv in self.get_records(prefix, range_end):
            yield type(kv.key), type(kv.value)



    async def get_records(self, prefix, range_end=None):
        """
        """
        request = with_range(pb.RangeRequest(), prefix, range_end)
        resp = await self._stub.range(request, **self._stub._default_kwargs)
        self._stub._last_response = resp.header
        for kv in resp.kvs:
            yield kv

    async def put(self, key, value) :
        request = pb.PutRequest()
        request.key = ensure_bytes(key)
        request.value = ensure_bytes(value)

        resp = await self._stub.put(request, **self._default_kwargs)
        self._stub._last_response = resp.header

    async def delete(self, key):
        """
        Delete a single key in etcd.

        :param key: The record of the key to delete
        :returns: True if the record has been deleted
        """

        request = pb.DeleteRangeRequest()
        request.key = ensure_bytes(key)
        request.prev_kv = False

        resp = await self._stub.delete_range(request, **self._stub._default_kwargs)
        self._stub._last_response = resp.header

        return resp.deleted > 0

    async def delete_range(self, prefix, range_end=None):
        """
        Delete a range records from prefix to range_end, [prefix, range_end).
        If range_end is ignored, all records started with the prefix are deleted.

        :param prefix: The start of the range to delete.
        :param range_end: The end of the range to delete.
        :returns: the count of records that have been deleted
        """
        request = pb.DeleteRangeRequest()
        request = with_range(request, prefix, range_end)
        request.prev_kv = False

        resp = await self._stub.delete_range(request, **self._stub._default_kwargs)
        self._stub._last_response = resp.header

        return resp.deleted

    async def lease(self, ttl, key=None):
        return await Lease.get_lease(self._stub, ttl, key)

#
# def _translate_exception(exc):
#     code = exc.code()
#     exception = _EXCEPTIONS_BY_CODE.get(code)
#     if exception is None:
#         raise
#     raise exception
#
#
# def _handle_errors(f):
#     if inspect.isgeneratorfunction(f):
#         def handler(*args, **kwargs):
#             try:
#                 for data in f(*args, **kwargs):
#                     yield data
#             except grpc.RpcError as exc:
#                 _translate_exception(exc)
#     else:
#         def handler(*args, **kwargs):
#             try:
#                 return f(*args, **kwargs)
#             except grpc.RpcError as exc:
#                 _translate_exception(exc)
#
#     return functools.wraps(f)(handler)
