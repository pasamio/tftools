#!/bin/bash
# TapForms Finder
# Look for hosts advertising TapForms Sync and add them to a file for later usage.
# Useful for finding which port TapForms is using for it's P2P sync.

# Check to see that we're the only instance running.
if [ -f /tmp/tf-finder.lock ]; then
	kill -0 $(cat /tmp/tf-finder.lock) >/dev/null 2>&1
	if [ "$?" == "0" ]; then
		echo Lock file active and process running.
		exit 1
	fi
	echo "Lock file exists but not PID found, proceeding."
fi

set -e
#set -x

# Kill off our children
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

# Put our PID in the lock file and move on.
echo $$ > /tmp/tf-finder.lock

echo $1
if [ "x$1" == "x" ]; then
	# The path to the hosts file to update (useful for testing).
	HOSTS_FILE='/tmp/tf-hosts'
else
	HOSTS_FILE=$1
fi

if [ -f $HOSTS_FILE ]; then
	echo "Removing $HOSTS_FILE"
	rm $HOSTS_FILE
fi


# Temporary file to store the server list output from dns-sd
TMPFILE_SERVERS=`mktemp /tmp/tf_servers.XXXXXXX`
#echo $TMPFILE_SERVERS

# Find servers announcing TapForms Sync, give them 10 seconds to appear then kill the process and extract the servers.
# Then loop over each of the servers we found.
echo "Scanning network, this will take ten seconds..."
for i in `( (dns-sd -B _tapforms-sync._tcp. > $TMPFILE_SERVERS) & sleep 10; kill $! ); grep '_tapforms-sync._tcp.' $TMPFILE_SERVERS | sed -e 's/.*_tapforms-sync._tcp. *//'`
do
	# Obvious comment is obvious.
	echo Processing instance "$i"...

	# Get a file to store the results of the dns-sd resolution.
	TMPFILE_HOST=`mktemp /tmp/tf-dns_sd_resolve.XXXXXXX`
	#echo $TMPFILE_HOST

	# Give the system a second to dereference the name (should be long enough in most cases) and then extract it's IP address.
	DESTINATION=`( (dns-sd -L "$i" _tapforms-sync._tcp. > $TMPFILE_HOST) & sleep 1; kill $! ); grep "can be reached at" $TMPFILE_HOST | sed -e "s/.* can be reached at \([^ ]*\).*/\1/"`

	echo https://$DESTINATION/$(echo $i | sed -e's/@.*//') >> $HOSTS_FILE


	# We need to clean up the file we put the output for the host address lookup.
	#rm $TMPFILE_HOST
done

# We need to clean up the file we put the output for the list of servers.
#rm $TMPFILE_SERVERS
rm /tmp/tf-finder.lock
