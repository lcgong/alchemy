
from ._stubs.etcd.mvcc.mvccpb.kv_pb2 import (
    KeyValue,
    Event
    )

from ._stubs.etcd.etcdserver.etcdserverpb.rpc_pb2 import (
    RangeRequest,
    RangeResponse,
    PutRequest,
    PutResponse,
    DeleteRangeRequest,
    DeleteRangeResponse
    )

from ._stubs.etcd.etcdserver.etcdserverpb.rpc_pb2 import (
    AuthenticateRequest)

from ._stubs.etcd.etcdserver.etcdserverpb.rpc_pb2 import (

    # watch
    WatchCreateRequest,
    WatchCancelRequest,
    WatchRequest,
    WatchResponse,

    # lease
    LeaseGrantRequest,
    LeaseGrantResponse,
    LeaseRevokeRequest,
    LeaseRevokeResponse,
    LeaseKeepAliveRequest,
    LeaseKeepAliveResponse,
    LeaseTimeToLiveRequest,
    LeaseTimeToLiveResponse,
    LeaseLeasesRequest,
    LeaseLeasesResponse,
    LeaseStatus,
    )



from ._stubs.etcd.etcdserver.etcdserverpb import rpc_pb2_grpc as serverpb

import grpc
import asyncio

from .utils import ensure_bytes, to_str, with_range

class AsyncStub:
    def __init__(self, url):
        channel    = grpc.insecure_channel(url)
        stub_auth  = serverpb.AuthStub(channel)
        stub_kv    = serverpb.KVStub(channel)
        _stub_lease = serverpb.LeaseStub(channel)

        # kv service
        self.range = ensure_future(stub_kv.Range.future)
        self.put   = ensure_future(stub_kv.Put.future)
        self.delete_range   = ensure_future(stub_kv.DeleteRange.future)

        # lease service
        self.lease = ensure_future(_stub_lease.LeaseLeases.future)
        self.lease_grant = ensure_future(_stub_lease.LeaseGrant.future)
        self.lease_revoke = ensure_future(_stub_lease.LeaseRevoke.future)
        self.lease_keepalive = _stub_lease.LeaseKeepAlive
        # self.lease_keepalive = ensure_future(_stub_lease.LeaseKeepAlive.future)
        self.lease_ttl = ensure_future(_stub_lease.LeaseTimeToLive.future)

        self._last_response = None
        self._default_kwargs = dict() # timeout, credentials, ...

    @property
    def last_response(self):
        return self._last_response

    async def get_keyvalue(self, key):
        """
        """
        request = RangeRequest(key=ensure_bytes(key))
        resp = await self.range(request, **self._default_kwargs)
        self._last_response = resp.header

        # print(f'[{key}]', '\n', resp)

        if resp.count > 0:
            kv = resp.kvs.pop()
            return kv

    async def put_record(self, key, value=None, lease=None, ignore_value=False):
        request = PutRequest()
        request.key = ensure_bytes(key)

        if ignore_value:
            request.ignore_value = True
        else:
            request.value = ensure_bytes(value)

        if lease is not None:
            request.lease = lease

        resp = await self.put(request, **self._default_kwargs)
        self._last_response = resp.header

        return resp

def ensure_future(pb_future_func, loop=None):

    if loop is None:
        loop = asyncio.get_event_loop()

    def _wrap(*args, **kwargs):

        future    = asyncio.Future()
        pb_future = pb_future_func(*args, **kwargs)

        def _done_callback(pb_future):
            loop.call_soon_threadsafe(_done_set_result, future, pb_future)

        pb_future.add_done_callback(_done_callback)

        return future

    return _wrap

import re

_exc_msg_patterns = [
    re.compile(r'<.*\(StatusCode\.\w+,\s*(.*)\)>')
]


def regex_extract(text, patterns):
    for ptn in patterns:
        m = ptn.match(text)
        if not m: continue

        return m.group(1)



from .exception import _grpc_exceptions
def _done_set_result(future, pb_future):
    try:
        future.set_result(pb_future.result())
    except Exception as e:
        grpc_exc_cls = _grpc_exceptions.get(e.code(), None)
        if grpc_exc_cls:
            caused_msg = str(e)
            exc_msg = regex_extract(caused_msg, _exc_msg_patterns)
            if not exc_msg:
                exc_msg = caused_msg

            exc = grpc_exc_cls(exc_msg)
            # exc.__cause__ = e
        else:
            exc = e

        future.set_exception(exc)
