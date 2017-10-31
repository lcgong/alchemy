
from . import pb

def with_range(request, prefix, range_end=None):
    """ the key range (intervals) [prefix, range_end).
    If range_end is None, the range is keys started with prefix.
    https://coreos.com/etcd/docs/latest/learning/api.html
    """

    if range_end is None:
        assert isinstance(prefix, str)
        range_end = prefix[0:-1] + chr(ord(prefix[-1]) + 1)

    request.key = ensure_bytes(prefix)
    request.range_end = ensure_bytes(range_end)

    return request

def ensure_bytes(maybe_bytestring):
    if isinstance(maybe_bytestring, bytes):
        return maybe_bytestring
    else:
        return maybe_bytestring.encode('UTF-8')

def to_str(bytesstring):
    return bytesstring.decode('UTF-8')
