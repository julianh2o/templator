#!/bin/bash

docker run -it --volume `pwd`:/opt/app -e LOCAL_USER_ID=`stat -c '%u' .` yarn:latest yarn && yarn test
