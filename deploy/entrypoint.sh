#!/bin/sh
set -eu

: "${PORT:=10000}"
export PORT

envsubst '${PORT}' \
    < /app/deploy/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

nginx -t
exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
