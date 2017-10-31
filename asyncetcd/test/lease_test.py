
import asyncio
import pytest


@pytest.mark.asyncio
async def test_lease(etcd):
    prefix = '!test/a'
    cnt = await etcd.delete_range(prefix=prefix)
    print(f'{cnt} records have been deleted')

    await etcd.put(prefix + '/1', '1')

    lease = await etcd.lease(ttl=2, key=prefix + '/1')

    ttl, granted_ttl, keys = await lease.status(keys=True)
    print(f'LeaseID: {lease.lease_id} TTL: {ttl}/{granted_ttl}: {keys}')
    assert len(keys) == 1
    assert (await etcd.value(prefix + '/1')) == '1'

    await lease.put(prefix + '/1', '21')

    assert (await etcd.value(prefix + '/1')) == '21'
    await asyncio.sleep(1.5*lease.granted_ttl)
    assert (await etcd.value(prefix + '/1')) == None

    await lease.keepalive()
    ttl, granted_ttl, keys = await lease.status()
    print(f'LeaseID: {lease.lease_id} TTL: {ttl}/{granted_ttl}: {keys}')
