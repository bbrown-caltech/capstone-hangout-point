FROM python:3.9.6

ENV YAML_FILE=''

RUN apt update
RUN apt install -y vim

RUN pip install pyyaml

RUN mkdir -p /scripts
COPY ./config/misc/yaml_parser.py /scripts

ENTRYPOINT [ "python", "/scripts/yaml_parser.py" ]