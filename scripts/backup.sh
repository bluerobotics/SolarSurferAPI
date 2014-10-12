#!/bin/sh

mkdir -p ./backup/mongolab

echo "\n\n\nDownloading database...\n\n\n"
mongodump -h $1 \
          -d $2 \
          -u $3 \
          -p $4 \
          -o ./backup/mongolab

echo "\n\n\nArchiving temporary backup folder...\n\n\n"
zip -r ./backup/mongolab-$(date +"%Y%m%d-%H%M%S").zip ./backup/mongolab

echo "\n\n\nDeleting temporary backup folder..."
rm -R ./backup/mongolab

echo "\nDone."
