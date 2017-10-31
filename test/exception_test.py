import re
import asyncio
import pytest

import asyncetcd

@pytest.mark.asyncio
async def test_lease_exception(etcd):

    with pytest.raises(asyncetcd.exception.GRPCNotFound) as exc:
        await etcd._stub.put_record('c', 'c', lease=100000)
    print('Caught: ', exc)
    assert re.search(r'lease not found', str(exc)) is not None
