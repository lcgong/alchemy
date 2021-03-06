import inspect

from domainics.domobj.pagination import DPage
from domainics.domobj.pagination import parse_query_range, parse_header_range
from domainics.domobj import dset, dobject, DObject, DSet


from redbean.handler_argument import register_argument_getter, read_json
from redbean.handler_response import register_response_writer

from aiohttp.web import json_response
from redbean.json import json_dumps


def setup(app):
    register_argument_getter(_dobject_value_getter)
    register_argument_getter(_dpage_value_getter)
    register_response_writer(_rest_dobject_response_factory)

#----------------------------------------------------------------------------

def _dobject_value_getter(route_spec, arg_name):
    arg_spec = inspect.signature(route_spec.handler_func).parameters[arg_name]
    ann_type = arg_spec.annotation

# def _dobject_value_getter(proto, method, handler, path_params, arg_name):
#     arg_spec = inspect.signature(handler).parameters[arg_name]
#     ann_type = arg_spec.annotation


    if issubclass(ann_type, DSet[DObject]):
        item_type = ann_type.__parameters__[0]

        async def _getter(request):
            json_obj = await read_json(request)
            return dset(item_type)(json_obj)

        return _getter

    if issubclass(ann_type, DObject):
        async def _getter(request):
            json_obj = await read_json(request)
            return ann_type(json_obj)

        return _getter

def _dpage_value_getter(route_spec, arg_name):
# def _dpage_value_getter(proto, method, handler, path_params, arg_name):
    # arg_spec = inspect.signature(handler).parameters[arg_name]
    # ann_type = arg_spec.annotation
    arg_spec = inspect.signature(route_spec.handler_func).parameters[arg_name]
    ann_type = arg_spec.annotation

    if not issubclass(ann_type, DPage):
        return

    async def getter(request, arg_val):
        pass
        # arg_val = make_pagination(handler)
        # # arg_val = ann_type(arg_val)
        # return arg_val

    return getter


from collections.abc import Mapping, Sequence, Iterable
# ----------------------------------------------------------------------------
def _rest_dobject_response_factory(proto, method, handler):
    if proto != 'REST':
        return

    ret_type = inspect.signature(handler).return_annotation
    if not (issubclass(ret_type, DSet[DObject])
            or issubclass(ret_type, DObject)
            or issubclass(ret_type, Mapping)
            or issubclass(ret_type, Sequence)):
        return

    def _response(request, return_value):
        return json_response(return_value, dumps=json_dumps)

    return _response

