#!/bin/bash

# Set the backup base directory.
BACKUP_BASE=/usr/local/var/gitbackup

# Iterate through each of the backup destinations to process them.
for BACKUP in $BACKUP_BASE/*
do
	echo Processing $BACKUP
	# Set up the GIT environment variables
	export GIT_DIR=$BACKUP

	# Delete anything not from today and not at 1am
	echo "Deleting backups not created today or not created at 1am..."
	time (git branch -v | grep -v $(date +%Y-%m-%d) | grep -v master | grep -v _0100 | grep 'Auto commit' | awk '{print $1}' | xargs -n1 git branch -D)

	# Delete anything from this month last year.
	echo "Deleting backups from a year ago..."
	time (git branch -v | grep $(echo $(expr $(date +%Y) - 1)-$(date +%m)-) | grep -v master | grep 'Auto commit' | awk '{print $1}' | xargs -n1 echo git branch -D)

	# Prune and repack!
	echo "Running GC and repack..."
	time (git gc && git repack -a -d -l)
done
