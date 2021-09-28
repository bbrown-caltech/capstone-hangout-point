#!/bin/sh

echo "###################################################################################"
echo "# Starting Jenkins, Nexus and Ansible via Docker Compose"
echo "###################################################################################"

docker-compose up -d

sleep 5

echo "###################################################################################"
echo "# Updating Permissions on docker.sock Inside Container jenkins"
echo "###################################################################################"
docker exec -it jenkins bash -c "chmod 777 /var/run/docker.sock"

