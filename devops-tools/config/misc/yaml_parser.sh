#!/bin/sh

export YAML_FILE=${CHART_PATH}/Chart.yaml

git -C /source clone -b ${BRANCH} ${REPOSITORY} #> /dev/null

version=$(python /scripts/yaml_parser.py version)

helm package ${CHART_PATH} -d ${CHART_PARENT_PATH}

CHART_FILE_NAME="${CHART_PARENT_PATH}/${CHART_NAME}-${version}.tgz"
HELM_REPO_URL="https://nexus.brianbrown.me/repository/helm/${CHART_NAME}-${version}.tgz"

curl -k -v -u 'caltech:Password123' --upload-file ${CHART_FILE_NAME} ${HELM_REPO_URL}
