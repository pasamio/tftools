#!/bin/bash

# Set the backup base directory.
BACKUP_BASE=/usr/local/var/gitbackup

# Fix the backup time to now (to prevent skew between backups)
NOW=`date +%Y-%m-%d_%H%M`

echo "GIT Backup started at $(date)"

# Iterate through each of the backup destinations to process them.
for BACKUP in $BACKUP_BASE/*
do
	# Set up the GIT environment variables
	export GIT_DIR=$BACKUP
	export GIT_WORK_TREE=`cat $BACKUP/source`

	echo "Backing up $GIT_WORK_TREE to $GIT_DIR"
	echo
	cd $GIT_WORK_TREE
	echo "Creating new branch..."
	time git checkout --orphan $NOW
	echo "Adding files..."
	time git add -A .
	echo "Creating commit..."
	time git commit -m "Auto commit $NOW"
	echo "Backup complete for $GIT_WORK_TREE to $GIT_DIR"
done
echo "GIT Backup completed at $(date)"
