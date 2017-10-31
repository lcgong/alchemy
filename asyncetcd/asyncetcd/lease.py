
from . import pb
from .utils import ensure_bytes, to_str

class Lease:
    """ Primitives for consuming client keep-alive messages.
    """

    @classmethod
    async def get_lease(cls, stub, ttl, key, value=None):

        if key is None:
            leaseobj = cls(stub)
            await leaseobj.grant(ttl)
            return leaseobj

        record = await stub.get_keyvalue(key)
        if record is None:
            if value is None:
                value = b''

            leaseobj = cls(stub)
            await leaseobj.grant(ttl)
            leaseobj.put(key, value)

            return leaseobj

        if record.lease == 0:
            leaseobj = cls(stub)
            await leaseobj.grant(ttl)
            await stub.put_record(key, value,
                                  lease=leaseobj._lease_id, ignore_value=True)
        else:
            leaseobj = cls(stub, record.lease)

        await leaseobj.attach(key)

        return leaseobj

    def __init__(self, stub, lease_id=None):
        self._stub = stub
        self._lease_id = lease_id
        self._granted_ttl = None

    @property
    def lease_id(self):
        return self._lease_id

    @property
    def granted_ttl(self):
        return self._granted_ttl

    async def put(self, key, value) :
        await self._stub.put_record(key, value, lease=self._lease_id)


    async def attach(self, key) :
        """ attache a key to this lease.
        """
        await self._stub.put_record(key, lease=self._lease_id, ignore_value=True)

    async def detach(self, key) :
        """ detache a key to this lease.
        """
        await self._stub.put_record(key, lease=0, ignore_value=True)

    async def grant(self, ttl):
        """
        :param ttl: the advisory time-to-live, in seconds.
        """
        request = pb.LeaseGrantRequest(TTL=ttl, ID=self._lease_id)
        resp = await self._stub.lease_grant(request, **self._stub._default_kwargs)
        if self._lease_id is None:
            self._lease_id = resp.ID

        # the server selected time-to-live, in seconds, for the lease.
        self._ttl = resp.TTL
        self._granted_ttl = self._ttl
        self._last_response = resp.header

        return self

    async def revoke(self):
        """ revoke this lease.
        When the lease is revoked, ALL attached keys are removed.
        """
        if self._lease_id is None:
            return

        request = pb.LeaseRevokeRequest(ID=self._lease_id)
        resp = await self._stub.lease_Revoke(request, **self._default_kwargs)
        self._last_response = resp.header

        return self

    async def keepalive(self):
        """ refresh this lease, and get the new time-to-live, in seconds,
        that the lease has remaining.
        """
        def gen():
            request = pb.LeaseKeepAliveRequest(ID=self._lease_id)
            yield request # just one request

        for resp in self._stub.lease_keepalive(gen()):
            #  the new time-to-live, in seconds, that the lease has remaining
            self._ttl = resp.TTL
            # self._granted_ttl = resp.grantedTTL # maybe others change it

            self._last_response = resp.header
            return self

    async def status(self, type=to_str, keys=False):
        """ Get keys that are attached to this lease.

        TTL is the remaining TTL in seconds for the lease; the lease will
        expire in under TTL+1 seconds.
        GrantedTTL is the initial granted time in seconds upon lease
        creation/renewal.

        :param type: A callable that is used to cast the key value.
        The default type of key's value is UTF-8 string.
        :type type: Callable

        :param type: Keys is the list of keys attached to this lease.
        :type type: boolean

        :returns: (TTL, granted TTL, keys attached in lease)
        """
        request = pb.LeaseTimeToLiveRequest(ID=self._lease_id, keys=keys)
        resp = await self._stub.lease_ttl(request, **self._stub._default_kwargs)
        self._last_response = resp.header

        return resp.TTL, resp.grantedTTL, list(type(k) for k in resp.keys)

    def __repr__(self):
        return (f'Lease(id={self._lease_id}, granted_ttl={self._granted_ttl})')
