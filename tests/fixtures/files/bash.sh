#!/bin/bash

old=$(git tag | awk '/./{line=$0} END{print line}')

if [[ ! $(grep -q "$1" setup.py && echo $?) ]]
then
	echo $1
    sed -i '' 's/'"$old"'/'"$1"'/g' setup.py
     # @todo Make an issue
    echo "Error: $1 not found in setup.py. I just replaced it, please commit and push then start this script again"
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi
