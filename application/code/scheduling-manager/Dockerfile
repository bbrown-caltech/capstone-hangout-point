######################################################################################################################################
#   Author: BBrown
#   Date: 09/16/2021
#   Description: Serves as the default build image
######################################################################################################################################
FROM ubuntu

EXPOSE 3000

USER root

#   INSTALL NODE
RUN apt update -y
RUN apt install -y curl inetutils-ping vim
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt update
RUN apt install -y nodejs

#   CREATE APPLICATION USER & GROUP
RUN groupadd docker
RUN useradd -m expressapi -G docker
RUN usermod -g docker root

#   CREATE APPLICATION DIRECTORY
RUN mkdir -p /app

#   COPY APPLICATION FILES
COPY ./models /app/models
COPY ./resources /app/resources
COPY ./swagger /app/swagger
COPY ./index.js /app/index.js
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json /app/package.json

#   SET WORKING DIRECTORY & INSTALL APPLICATION DEPENDENCIES
WORKDIR /app
RUN npm install 
# --prefix /app

#   CHANGE APPLICATION DIRECTORY OWNER
RUN chown -R expressapi:docker /app

#   SET USER
USER expressapi

ENTRYPOINT [ "node", "/app/index.js" ]
