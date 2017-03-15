


https://www.daocloud.io/mirror#accelerator-doc

https://github.com/docker/machine


从github的docker-machine下载或者从阿里云镜像下载，如下
https://mirrors.aliyun.com/docker-toolbox/linux/machine/0.9.0/docker-machine-Linux-x86_64

按照[提示](https://docs.docker.com/machine/install-machine/)安装docker machine

docker-machine rm -f $(docker-machine ls -q)

给虚拟机配置docker的阿里的镜像加速器

docker-machine ssh default "echo ... "

echo "DOCKER_OPTS=\"--registry-mirror=https://pee6w651.mirror.aliyuncs.com\"" | sudo tee -a /etc/default/docker
sudo service docker restart

docker-machine stop $(docker-machine ls -q)


; https://lostechies.com/gabrielschenker/2016/09/05/docker-and-swarm-mode-part-1/
;
