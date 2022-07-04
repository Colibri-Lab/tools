#!/bin/sh

CURDIR=$(dirname $0)
if [ "$CURDIR" = '.' ]
then
    CURDIR=`pwd`
fi
cd $CURDIR
cd ../web && /usr/bin/php index.php localhost /modules/tools/backup/cron.json backup=$1 user=$2