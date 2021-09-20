FROM python:3.9.6

ENV YAML_FILE=''
ENV BRANCH=''
ENV REPOSITORY=''

RUN apt update
RUN apt install -y vim git

RUN pip install pyyaml

RUN mkdir -p /source
RUN mkdir -p /scripts
COPY ./config/misc/yaml_parser.py /scripts
COPY ./config/misc/yaml_parser.sh /scripts

RUN chmod +x /scripts/yaml_parser.sh

WORKDIR /source

ENTRYPOINT [ "/scripts/yaml_parser.sh" ]