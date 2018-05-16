

from aiohttp.web import middleware

@middleware
async def session(request, handler):
    resp = await handler(request)
    resp.text = resp.text + ' wink'
    return resp

