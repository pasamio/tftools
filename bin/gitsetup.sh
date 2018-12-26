#!/bin/bash
set -e
# Set the backup base directory.
BACKUP_BASE=/usr/local/var/gitbackup
SOURCE_DEFAULT=/usr/local/var/tfsync/backups
DEST_DEFAULT=/usr/local/var/gitbackup

read -e -p "Enter source directory [default: $SOURCE_DEFAULT]: " SOURCE

if [ "x$SOURCE" == "x" ];
then
	SOURCE=$SOURCE_DEFAULT
fi

if [ ! -d "$SOURCE" ];
then
	echo "Source directory doesn't exist: $SOURCE"
	exit 1
fi

read -p "Enter destination directory [default: $DEST_DEFAULT]: " DEST

if [ "x$DEST" == "x" ];
then
	DEST=$DEST_DEFAULT
fi

if [ ! -d "$DEST" ];
then
	echo "Desintation directory doesn't exist: $DEST"
	exit 2
fi

read -p "Enter backup name: " BACKUP

if [ "x$BACKUP" == "x" ];
then
	echo "No backup name entered, aborting."
	exit 3
fi


ORIGIN=$SOURCE/$BACKUP
TARGET=$DEST/$BACKUP

echo "Source: $ORIGIN"
echo "Destination: $TARGET"

if [ ! -d "$ORIGIN" ];
then
	echo "WARNING: Source directory doesn't exist, make sure you have a backup setup first!"
fi

if [ -d "$TARGET" ];
then
	read -e -p "Target directory exists, continue? [y/n] " CONT
	if [ "$CONT" != "y" ];
	then
		exit 10
	fi
fi

set -x
mkdir -p  $TARGET
cd $TARGET
git init --bare
echo $SOURCE/$BACKUP > source

