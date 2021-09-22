#!/bin/sh

CONFIG_FILE=/dockerrun/config/config.js
DESTINATION_FILE=/usr/share/nginx/html/js/application/config.js

if [[ -f $CONFIG_FILE ]]; then
    cp $CONFIG_FILE $DESTINATION_FILE
fi

find /usr/share/nginx/html/* -type d -print0 | xargs -0 chmod 755

/docker-entrypoint.sh "nginx" "-g" "daemon off;"
