#!/bin/bash

mkdir -p data
docker run -it --volume `pwd`/data:/opt/data -e LOCAL_USER_ID=`stat -c '%u' .` typescripttemplate:latest
