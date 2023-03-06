#!/bin/bash

SERVICE="SERVICE"
DEST="./docker"

# Compress the code into SERVICE.tgz
tar -zcvf ${SERVICE}.tgz --exclude="node_modules" *

# Move SERVICE.tgz into the ./docker folder
mv ${SERVICE}.tgz ${DEST}/
