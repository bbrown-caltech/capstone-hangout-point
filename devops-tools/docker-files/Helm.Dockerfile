FROM python:3.9.6

ENV BRANCH=''
ENV REPOSITORY=''
ENV CHART_NAME=''
ENV CHART_PATH=''
ENV CHART_PARENT_PATH=''

RUN apt update
RUN apt install -y vim wget git curl

WORKDIR /tmp

RUN wget https://get.helm.sh/helm-v3.7.0-linux-amd64.tar.gz
RUN tar -zxvf helm-v3.7.0-linux-amd64.tar.gz
RUN mv linux-amd64/helm /usr/local/bin/helm

RUN pip install pyyaml

RUN mkdir -p /source
RUN mkdir -p /scripts
COPY ./config/misc/yaml_parser.py /scripts
COPY ./config/misc/yaml_parser.sh /scripts

RUN chmod +x /scripts/yaml_parser.sh

WORKDIR /source

ENTRYPOINT [ "/bin/bash" ]
# ENTRYPOINT [ "helm" ]