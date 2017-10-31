
import asyncio
import pytest

import asyncetcd

@pytest.mark.asyncio
async def test_keepalive(etcd):
    lease = await etcd.lease(ttl=3)
    ttl, granted_ttl, keys = await lease.status()
    print(f'LeaseID: {lease.lease_id} TTL: {ttl}/{granted_ttl}: {keys}')
    assert ttl >= 2

    await asyncio.sleep(1)
    ttl, granted_ttl, keys = await lease.status()
    print(f'LeaseID: {lease.lease_id} TTL: {ttl}/{granted_ttl}: {keys}')
    assert ttl < 2

    await lease.keepalive()
    ttl, granted_ttl, keys = await lease.status()
    print(f'LeaseID: {lease.lease_id} TTL: {ttl}/{granted_ttl}: {keys}')
    assert ttl >= 2

    await asyncio.sleep(4)
    ttl, granted_ttl, keys = await lease.status()
    print(f'LeaseID: {lease.lease_id} TTL: {ttl}/{granted_ttl}: {keys}')
    assert ttl < 0
    await lease.keepalive()
    assert ttl < 0

    with pytest.raises(asyncetcd.exception.GRPCNotFound):
        await lease.put('!test/a', '123')
