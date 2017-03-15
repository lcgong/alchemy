

## letsencrypt SSL证书

### 申请letsencrypt证书

配置nginx，使得letsencrypt能够在网站.well-known/acme-challenge登录
```
# For letsencrypt to authenticate domain
location ^~ /.well-known/acme-challenge/ {
    default_type "text/plain";
    root /alchemy/secrets/letsencrypt/www;
}
location = /.well-known/acme-challenge/ { # not 403
    return 404;
}
```

```sh
letsencrypt certonly --webroot -w /alchemy/secrets/letsencrypt/www \
  -d alchemy.29th.cn \
  --config-dir /alchemy/secrets/letsencrypt/config \
  --work-dir /alchemy/secrets/letsencrypt/var --logs-dir /alchemy/logs
```

强化加密
```sh
openssl dhparam -out /alchemy/secrets/letsencrypt/config/keys/dhparams.pem 2048
```

```
 sudo apt-get install letsencrypt
```

使用[SSL Server Test](https://www.ssllabs.com/ssltest/analyze.html)检查服务器SSL证书的安全性

### 自动定时更新

```
sudo apt install systemd-cron
```

```
#!/usr/bin/env bash

BASEDIR=/alchemy/secrets/letsencrypt
LOGDIR=/alchemy/logs
DOMAINS="-d alchemy.29th.cn"

letsencrypt --renew certonly --webroot -w $BASEDIR/www $DOMAINS \
  --config-dir $BASEDIR/config --work-dir $BASEDIR/var --logs-dir $LOGDIR

systemctl reload nginx.service
```
使用```crontab -e```添加下面的定时任务，每月在2AM执行一次
```
0 2 1 * * /alchemy/deployment/letsencrypt-renew.sh
```
