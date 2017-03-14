

使用[OAuth2](https://oauth.net/2/)登录的好处
* 应用不是平台，无需管理用户身份
* 避免用户记太多的用户名和密码
* 用户可以绑定多个OAuth，避免忘记原来的登录方式


## OAuth登录的申请
* Github OAuth登录（无需人工申请，可直接使用）
> https://github.com/settings/developers

* 微软的Live Connect （无需人工申请，可直接使用）
> https://apps.dev.microsoft.com

* 在QQ互联申请QQ号OAUTH登录（需域名备案，提交有公章的影印件，人工审核）
> https://connect.qq.com

* 网易账号OAUTH登录（邮件申请，需人工审核）
> http://reg.163.com/help/help_oauth2.html  

* 支付宝OAuth，接口相对有点复杂，可用沙箱测试，正式上线需提交计划书人工审核

* 新浪微博账号OAuth登录申请，申请后只能用测试账号，待开发完成后可以提交申请
> http://open.weibo.com  获得App Key和App Secret

* 在微信开放平台申请通过微信扫码登录网站（人工审核，还需要进行单位付费认证）
>  https://open.weixin.qq.com



## 测试Github的OAuth登录

申请后会获得client_id和client_secret

第一步，应用（client）向Github申请获得code，需要填写
  * client_id
  * redirect_uri Github用户认证后需要回调的地址
  * scope 获得权限范围，申请是user:email，除了用户常规信息，还包含用户电子邮件
  * state 应用产生的一随机码，为了避免CSRF攻击
根据以上信息产生类似下面这个地址，通过浏览器访问，github待用户登录后，第一次会向用户确认授权
```
https://github.com/login/oauth/authorize?client_id=a7c694aeeaxxxxxxxxx&state=RANDOM&redirect_uri=http%3A%2F%2Falchemy.29th.cn%2Foauth%2Fgithub&scope=user%3Aemail
```

Github认证成功后，会回调上面指定的网址，并附带了code和state两个参数，类似如下
```
http://alchemy.29th.cn/oauth/github?code=1f37ccb35cd613d8f454&state=RANDOM
```
code为继续后面验证临时码，state应和前面给定的随机码一致，应用应该有义务检查是否一致，避免发生CSRF漏洞。


第二步，应用凭借获得code和client_secret向github获得授权码access_token。需要向https://github.com/login/oauth/access_token 发送一个POST请求，需要code, client_secret, client_id, state, redirect_uri等参数。

使用curl模拟这次请求
```sh
curl -H "Accept: application/json" -X POST \
  -d "code=1f37ccb35cd613d8f454&client_id=a7c694aeeaxxxxxxxxx&client_secret=7e975f82da12xxxxxxxxxxxxxx&redirect_uri=http%3A%2F%2Falchemy.29th.cn%2Foauth%2Fgithub&state=RANDOM" \
  https://github.com/login/oauth/access_token
```
返回
```json
{
  "access_token":"54f6eb1188c38fbxxxxxxxxxxxxxxxxx",
  "token_type":"bearer",
  "scope":"user:email"
}
```
> 在请求的头部信息添加```Accept: application/json```表示要求返回JSON数据，如上所示。

第三步，依据access_token获得用户信息

向Github发送获取用户信息请求时通过头```Authorization: token ACCESS_TOKEN```进行验证
```sh
curl -H "Authorization: token 54f6eb1188c38fbxxxxxxxxxxxxxxxxx" \
https://api.github.com/user
```
返回用户信息
```js
{
  "id": 123456,
  "login": "USER_NAME",
  "name": "Full Name",
  "type": "User",
  "avatar_url": "https://avatars3.githubusercontent.com/u/127480?v=3",
  ......
}
```

同理，获得用户的电子邮件
```
curl -H "Authorization: token 5249bd89xxxxxxx" \
https://api.github.com/user/emails
```
```js
[
 {
   "email": "user@gmail.com",
   "primary": true,
   "verified": true,
   "visibility": "public"
 }
]
```
