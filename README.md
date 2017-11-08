

* webapp Web浏览器前端，采用angualr 2和nodejs
* services 服务后端，采用python


```
git remote add asyncetcd https://github.com/lcgong/asyncetcd.git

git subtree add --prefix asyncetcd asyncetcd master --squash
```


在angular/cli无法正常检测到文件变化时，尝试提高限制
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

```