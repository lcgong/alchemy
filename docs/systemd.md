

### 安装postgresql
参照 https://www.postgresql.org/download/linux/ubuntu/ 在Ubuntu上安装

```
deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main
```
```
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
  sudo apt-key add -
sudo apt-get update

```

###

使用unit模板
<service_name>@<argument>.service


比如创建```app-busiserv@.service```unit，符号表示模板的参数，在unit文件里替代%i变量

例如启动两个端口号分别为8801和8802的服务，@8801将用8801替换给unit文件的%i。
```
$ sudo systemctl start app-busiserv@8801.service
$ sudo systemctl start app-busiserv@8802.service
```

```
[Unit]
Description=REST Services (%i)
AssertPathExists=/app/services

[Service]
Type=notify
ExecStart=/app/services/server.py --port=%i


[Install]
WantedBy=multi-user.target
```
