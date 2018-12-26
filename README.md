Tools for Tap Forms
=====

This repository has many PHP based tools for interacting with a
CouchDB instance connected to Tap Forms for Mac and iOS.

This requires an installation of the PHP CLI and also some scripts
require the curl extension. These are available by default on macOS.

For more information about Tap Forms check out [TapForms.com](http://www.tapforms.com).

In the samples, the path `/path/to/tftools` should point to your
checkout of Tools for Tap Forms (this GIT repo).

# Basic Configuration

There is a `configs` directory which contains INI files with the
configuration contained within them. By default it assumes you can
run this script with access to `/usr/local/var/tfsync` though you
can change this to suit your case.

| Option Name | Default | Description |
| ----------- | ------- | ----------- |
| sequencePath | `/usr/local/var/tfsync` | Path to store the CouchDB sequence files. These files enable processing incremental changes from the CouchDB server. |
| dbName | N/A | This is the Tap Forms unique identifier for your database/document on the CouchDB server. |
| dbHost | `http://username:password@localhost:5984` | Hostname string for connecting to your CouchDB server. |
| features | `backup` | Features enabled for the configuration. Backup is always enabled and is the default. |
| name | (Optional) | A friendly name to refer to this configuration in user output. |


# Scripts 

## Backup

The `backup-db.php` script will take your CouchDB instance and write
it to a desintation directory configured by `backupPath`. Using cron
you can then incrementally backup your database and use third party
tools like Time Machine or the included GIT tools to keep copies of
your backups.


| Option Name | Default | Description |
| ----------- | ------- | ----------- |
| backupPath  | `/usr/local/var/tfsync/backups/sample` | Path to the backup location. |


### Setting up Cron

Use the following entry to backup your database with `crontab -e` to
update your crontab. You will have to update the path to point to
your checkout of `tftools`.

```
# Backup TF databases from CouchDB ten minutes before the hour.
50 * * * *  /path/to/tftools/backup-db.php > /tmp/backup-db.log 2>&1
```

This will run ten minutes before every hour to backup your database.
It will then store a log file in `/tmp/backup-db.log`.

If you have Time Machine, this will automatically create incremental
backups of your database over time.

### Setting up GIT backups

Once you have hourly backups set up, you can use GIT to do snapshots
of your database. In the `bin` directory are three scripts:

- `gitsetup.sh`: This script will use `/usr/local/var/gitbackup` as
  the destination to store the backups and will create a new GIT
  bare repository and point to the source directory of your backups.
- `gitbackup.sh`: This script will use `/usr/local/var/gitbackup` as
  the destination. Each directory in this path should be a bare
  repository with a file called `source`.
- `gitprune.sh`: This script will use `/usr/local/var/gitbackup` as
  the destination to automatically remove old backups. It leaves
  hourly backups for the last day and daily backups (1am snapshot)
  for the last year. After a year all backups will be deleted.

For these to work, you'll want to add a crontab entry for both of
these scripts using `crontab -e`:

```
# Do git snapshots hourly.
@hourly /path/to/tftools/bin/gitbackup.sh > /tmp/gitbackup.log 2>&1 

# Clean up at 11:50pm 
50 23 * * * /path/to/tftools/bin/gitprune.sh > /tmp/gitprune.log 2>&1
```

Once you've done that, run `gitsetup.sh` to create a new bare GIT
repository to configure your previously created backup.

## Build Tree

This script, named `build-tree.php`, will connect to the CouchDB
instance and dump out the tree of all configured databases on the
system. This is useful during script development to be able to
get a full list of the internal field identifiers for use with
`getFieldValue` and similar commands. Assuming you have the basic
configuration set up, you can run `./build-tree.php` to get a
listing of all documents, forms and their fields.


## ElasticSearch

One of the capabilities is the ability to propagate the changes from
your Tap Forms database into an ElasticSearch index that can be
accessed via Kibana to visualise your data.

| Option Name | Default | Description |
| ----------- | ------- | ----------- |
| esIndex | test | ElasticSearch index name to use for this database. |
| esHost | `http://localhost:9200` | Hostname details for ElasticSearch server. |


To run this, set up `get-changes.php` to run regularly via `crontab -e`:

```
# Update ElasticSearch from the other databases once an hour.
@hourly php /path/to/tftools/get-changes.php > /tmp/tf-couchdb-es-sync.log 2>&1
```

The script will then use the configuration options to push changes
from CouchDB over to the ElasticSearch instance.
