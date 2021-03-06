# Backup

The `backup-db.php` script will take your CouchDB instance and write
it to a desintation directory configured by `backupPath`. Using cron
you can then incrementally backup your database and use third party
tools like Time Machine or the included GIT tools to keep copies of
your backups.


| Option Name | Default | Description |
| ----------- | ------- | ----------- |
| backupPath  | `/usr/local/var/tfsync/backups/sample` | Path to the backup location. |


## Setting up Cron

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

## Setting up GIT backups

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


