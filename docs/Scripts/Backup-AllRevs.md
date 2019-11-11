# Backup All Revs

The `backup-allrevs.php` script is a brute force backup tool designed to
attempt to retrieve every possible revision available from a CouchDB
compatible source (e.g. a CouchDB server or Tap Forms document).

This script is intended to help understand the detailed state of the
internals of CouchDB and to retrieve what otherwise might be lost.
Currently it doesn't attempt to retrieve deleted documents but will
attempt to retrieve previous revisions of existing documents.

The `backup-allrevs.php` script takes an optional argument which is the
path to the backup location. The deafult for this is a `backups` folder
in the current working directory of the script. 

The `backup-allrevs.php` script doesn't use the standard `configs`
directory but instead uses it's own `backups` directory and a
`config.ini` file instead of it. There is a distribution
`config.ini-dist` that ships in the backup directory for reference that
can be copied to `config.ini` in the directory where you want to backup
the data. This can be used with the following three options:


| Option Name  | Default               | Description |
| ------------ | --------------------- | ----------- |
| perHost      | false                 | Controls if it should create per host backups. Enable when you are trying to recover from a sync meltdown.
| couchHosts[] | http://localhost:5984 | An array of CouchDB hosts to scan. One per line with the square brackets included to make it an array for PHP.
| instancePath | /tmp/tf-hosts         | Path to a list of discovered Tap Forms instances.

In running this script, it will attempt to download any revision
available from any detected servers.

# Couch Hosts

The `backup-allrevs.php` script will accept a CouchDB server as an
option and will attempt to discover any Tap Forms documents on it (e.g.
entries with a `db-` prefix) and then download any revisions stored
within them.


# How to detect a server

In the `bin` directory is a `tf-finder.sh` script and a
`tf-finder-linux.sh` script. These two scripts should create a file at
`/tmp/tf-hosts` with URLs matching discovered Tap Forms servers on the
local network using Bonjour or multicast DNS. This can be used with the
`backup-allrevs.php` script to automatically backup any Tap Forms
instance on the network.

Alternatively you can populate this file with your own entries manually
for them to be backed up. The path to this file is configurable through
the `instancePath` setting listed above in `config.ini`.


# Example

In general, running the following from the `tftools` directory should
get you up and running pretty quickly. This includes automatic discovery
and running CouchDB on `localhost`. If this isn't true, you'll need to
change your `config.ini` in the backup directory.

```
$ ./bin/tf-finder.sh
$ ./backup-allrevs.php
```

This should populate the `/tmp/tf-hosts` directory and should trigger a
backup to be created in the `backups` directory automatically. The
`backup-allrevs.php` script is verbose and will log every request it
makes. It make take some time to backup large documents.
