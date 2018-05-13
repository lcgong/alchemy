import logging
from redbean import route_base, REST, HTTP
from domainics.domobj import dset, datt, dobject, DObject, DSet

# from domainics import P, transaction, sqltext

from sqlblock import SQL
from sqlblock.asyncpg import transaction

route_base('../user/')

# class CurrentUser:
#
#     @property
#     def __init__(principal_id):
#         self._principal_id = principal_id
#
#     @property
#     def principal_id(self):
#         return self._principal_id
#
#
#
# def _current_user_value_getter(proto, method, handler, path_params, arg_name):
#     arg_spec = inspect.signature(handler).parameters[arg_name]
#     ann_type = arg_spec.annotation
#
#     if not issubclass(ann_type, CurrentUser):
#         return
#
#     read_argval = default_argval_getter_factory(proto, method, handler, path_params, arg_name)
#
#     async def getter(request):
#         arg_val = arrow.get(read_argval(request)).datetime
#         return arg_val
#
#     return getter

@REST.GET('{user_id}/hi')
async def hi(user_id: int) -> DObject:

    return {"id": user_id}


@REST.GET('{user_id}/session')
@transaction.db
async def get_user_session(user_id: int, db) -> DObject:
    # raise Invalidation(f"用户{user_id}没有满足条件")
    # u = User(user_id=user_id)
    db << "SELECT pg_backend_pid() as pid FOR UPDATE";
    await db
    for r in db:
        print(r)

    # return {"id": row1.pid}
    return {"id": 100000}
