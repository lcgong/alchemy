


class KeyValue(object):
    def __init__(self, keyvalue):
        self._pb_kv = keyvalue

    @property
    def key(self):
        "key in bytes. An empty key is not allowed."
        return self._pb_kv.key

    @property
    def create_revision(self):
        "revision of the last creation on the key."
        return self._pb_kv.create_revision

    @property
    def mod_revision(self):
        "revision of the last modification on the key."
        return self._pb_kv.mod_revision

    @property
    def version(self):
        """version is the version of the key.
        A deletion resets the version to zero and any modification of the key
        increases its version."""
        return self._pb_kv.version

    @property
    def lease(self):
        """the ID of the lease attached to the key.
        If lease is 0, then no lease is attached to the key."""
        return self._pb_kv.lease
