from functools import wraps

from hashlib import md5 as hash_md5

# from urllib.parse import quote
# quote('测试', safe=b"/#%[]=:;$&()+,!?*@'~")

def _make_cache_key(prefix, *args, **kwargs):
    args_key = ','.join(
        [repr(x) for x in args] +
        [f'{k}={repr(v)}' for k, v in kwargs.items()]
    )
    args_key = hash_md5(args_key).hexdigest()

    return  prefix + '$' + args_key

def memorize(timeout=None):
    def decorator(func):
        @wraps(func)
        def inner(*args, **kwargs):
            cache_key = _make_cache_key(*args, **kwargs)
            result = cache.get(cache_key)
            if result is None:
                result = func(*args, **kwargs)
                cache.set(cache_key, result, timeout)
            return result

    return decorator
