#!/usr/bin/env bash

BASEDIR=/alchemy/secrets/letsencrypt
LOGDIR=/alchemy/logs
DOMAINS="-d alchemy.29th.cn"

letsencrypt --renew certonly --webroot -w $BASEDIR/www $DOMAINS \
  --config-dir $BASEDIR/config --work-dir $BASEDIR/var --logs-dir $LOGDIR

systemctl reload nginx.service
