######################################################################################################################################
#   Author: BBrown
#   Date: 08/25/2021
#   Description: The build argument that enables the developer to specify the build source
#                   local  = Local repository
#                   remote = Remote Bitbucket repository
######################################################################################################################################
ARG ENVIRONMENT='remote'

######################################################################################################################################
#   Author: BBrown
#   Date: 09/20/2021
#   Description: Serves as the local repository container
######################################################################################################################################
FROM docker.brianbrown.me/base-images/custom-web-image:build AS local
WORKDIR /source
RUN mkdir -p /source/book-my-show
COPY ./ /source/book-my-show


######################################################################################################################################
#   Author: BBrown
#   Date: 09/20/2021
#   Description: Serves as the remote repository container
######################################################################################################################################
FROM docker.brianbrown.me/base-images/custom-web-image:build AS remote
ARG BRANCH
WORKDIR /source
RUN mkdir -p /source/book-my-show
RUN git clone -b ${BRANCH} https://github.com/bbrown-caltech/capstone-hangout-point.git
RUN mv -R /source/capstone-hangout-point/application/code/book-my-show /source/book-my-show


######################################################################################################################################
#   Author: BBrown
#   Date: 09/20/2021
#   Description: Serves as the build container
######################################################################################################################################
FROM ${ENVIRONMENT} AS build

WORKDIR /source/book-my-show
RUN npm install -g typescript
RUN npm install
RUN rm -rf /source/book-my-show/build
RUN mkdir -p /source/book-my-show/build
RUN tsc
RUN node copy.js
WORKDIR /source/book-my-show/build
RUN npm install --only=production
WORKDIR /source/book-my-show
RUN node post-build-clean.js
RUN npm rebuild node-sass
RUN node ./node_modules/node-sass/bin/node-sass ./src/application -o ./build/js/application
RUN node ./node_modules/node-sass/bin/node-sass ./src/static/assets/css -o ./build/assets/css
RUN cp /source/book-my-show/application-start.sh /source/book-my-show/build/application-start.sh
RUN tar -czvf book-my-show.tar.gz -C build .


######################################################################################################################################
#   Author: BBrown
#   Date: 01/10/2021
#   Description: Used to create our final image
######################################################################################################################################
FROM nginx:alpine

## Copy our default nginx config
COPY --from=build /source/book-my-show/nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 777 /etc/nginx/conf.d

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=build /source/book-my-show/book-my-show.tar.gz /usr/share/nginx/html/book-my-show.tar.gz

## Change working directory and expand archive
WORKDIR /usr/share/nginx/html
RUN tar -xvzf book-my-show.tar.gz

## This is necessary for running in Kubernetes
RUN mkdir -p /dockerrun/config
RUN cp /usr/share/nginx/html/application-start.sh /dockerrun/application-start.sh
RUN chmod 775 /dockerrun/application-start.sh
RUN ls /dockerrun -al

## Remove archive & move application config files
RUN rm -rf /usr/share/nginx/html/book-my-show.tar.gz
RUN rm -rf /usr/share/nginx/html/application-start.sh
RUN mv /usr/share/nginx/html/js/application/config.js /dockerrun/config/config.js

## Install curl for debugging
RUN apk add curl

WORKDIR /

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "-c", "/dockerrun/application-start.sh"]
