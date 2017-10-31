
import logging

# class ContextFilter(logging.Filter):
#     def __init__(self, trim_amount):
#         self.trim_amount = trim_amount
#     def filter(self, record):
#         import traceback
#         record.stack = ''.join(
#             str(row) for row in traceback.format_stack()[:-self.trim_amount]
#         )
#         return True

# Now you can create the logger and apply the filter.
# logger = logging.getLogger()
# logger.addFilter(ContextFilter(5))


logging.basicConfig(format='[%(filename)s %(asctime)s %(levelname)s] %(message)s', datefmt="%M:%S", level=logging.DEBUG)
logger = logging.getLogger(__name__)

import pytest

@pytest.fixture(scope='session')
def event_loop(request):
    """
    To avoid the error that a pending task is attached to a different loop,
    create an instance of the default event loop for each test case.
    """
    logger.debug('NEW   event_loop')
    import asyncio
    loop = asyncio.get_event_loop()
    # loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
    logger.debug('CLOSE event_loop')

#
import asyncetcd
@pytest.fixture(scope='function')
def etcd(request, event_loop):
    logger.debug('NEW etcd client')
    etcd = asyncetcd.Client(url="localhost:2379")
    yield etcd
    logger.debug('CLOSE etcd client')
