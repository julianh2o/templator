#!/bin/bash

if [[ ! -z $(git status -s) ]] ; then
    >&2 echo "Please resolve modified/untracked files"
    exit 1
fi

npm run build && npm test && npm version patch && git push origin master --tags && npm publish
