FROM debian:11.0

RUN apt update
RUN apt install -y wget git curl

WORKDIR /tmp

RUN wget https://get.helm.sh/helm-v3.7.0-linux-amd64.tar.gz
RUN tar -zxvf helm-v3.7.0-linux-amd64.tar.gz
RUN mv linux-amd64/helm /usr/local/bin/helm

RUN helm plugin install --version master https://github.com/sonatype-nexus-community/helm-nexus-push.git

WORKDIR /

ENTRYPOINT [ "helm" ]