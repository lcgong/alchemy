
import asyncio
import pytest

@pytest.mark.asyncio
async def test_get_put(etcd):

    cnt = await etcd.delete_range(prefix='!test/a')
    print(f'{cnt} records have been deleted')
    #
    for i in range(10):
        await etcd.put(f'!test/a/{i+1}', f'a{i+1}')

    assert 'a2' == await etcd.value('!test/a/2')
    vals = [v async for k, v in etcd.items(prefix='!test/a')]
    assert len(vals) == 10 and vals[1] == 'a10' # a1, a10, a2, a3
