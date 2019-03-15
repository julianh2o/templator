#!/bin/bash

docker run -it --volume `pwd`:/opt/app -e LOCAL_USER_ID=`stat -c '%u' .` yarnbuilder:latest yarn build
docker build . -t typescripttemplate:latest
