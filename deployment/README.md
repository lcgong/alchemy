
* 在ubuntu上安装[docker](https://docs.docker.com/engine/installation/linux/ubuntu/)

Docker 推送镜像到 阿里Docker镜像
https://cr.console.aliyun.com

创建一个公有镜像或私有的镜像

* 登录镜像
  ```sh
  docker login -u <username> registry.cn-hangzhou.aliyuncs.com
  ```

* 拉取镜像，如镜像名myapi，lyucg是在阿里创建命名空间
  ```sh
  docker pull registry.cn-hangzhou.aliyuncs.com/lyucg/myapi:[镜像版本号]
  ```

* 推送镜像，镜像名```myapi```
  ```sh
  docker tag <镜像名称或ID> registry.cn-hangzhou.aliyuncs.com/lyucg/myapi:<镜像版本号>
  docker push registry.cn-hangzhou.aliyuncs.com/lyucg/myapi:[镜像版本号]
  ```


* 配置国内的Docker镜像
  1. 注册或登录[阿里云](https://dev.aliyun.com)，
  1. 在**管理中心/Docker镜像仓库/加速器**获得用户自己的获得镜像地址
    （如 ```https://????????.mirror.aliyuncs.com```）
  1. 修改或新建```/etc/docker/daemon.json```文件，填写镜像地址
  ```js
  {
      "registry-mirrors": ["https://????????.mirror.aliyuncs.com"]
  }
  ```
  1. 重启docker
  ```
  sudo systemctl daemon-reload
  sudo systemctl restart docker
  ```




在docker容器内完成镜像制作
```sh
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/app -w /app \
  docker docker build -t myapi .
```
  * 参数```--rm```容器运行结束后自动删除容器

### 常用技巧


* 在容器内执行 docker exec -it [container-name] [some-command]

* 查看docker系统所占用的存储空间
  ```docker system df```
* 清理docker系统所有不用的资源
  ```docker system prune```
* 清理镜像
  ```docker image prune --all```
*
  ```docker container prune```
*  
  docker network prune
*
  docker volume prune

删除所有的实例
docker rm -f $(docker ps -aq)
