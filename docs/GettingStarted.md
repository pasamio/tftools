# Getting Started Guide

This document will walk through getting started with TFTools and setting
up your first backup.

## Pre-reqs

You'll need the following packages installed on your computer:

* git
* php
* php curl extension

If you are using a Mac, PHP is installed by default and you can get GIT
from XCode or the command line tools. You can install the command line
tools by running the following command on your Mac:

`xcode-select --install`

If you are running a Linux distribution you can use the package manager
for your distribution to install those packages.

We're going to assume you're running this in your home directory,
something like `/Users/pasamio` or `/home/pasamio`. This guide will 
use `/home/pasamio` so change the directory to match your own.

## Check out source code

To check out the source code use the following from Terminal:

`git clone https://github.com/pasamio/tftools.git`

This should create a new directory called `tftools` in the directory.
Inside this directory are all of the scripts and also the configuration
directory. 

## Create new configuration

Inside the `tftools` directory is a `config` directory that contains
the configuration for the application. Copy the `sample.ini-dist` file
to a new file, for example:

`cp sample.ini-dist test.ini`

Use a text editor to open up the file and change the contents. Here's a
sample that uses my Linux home directory:

```
sequencePath = '/home/pasamio/tfsync'
backupPath = '/home/pasamio/tfsync/backups/test'
dbName = 'db-b538abdd2fc34e69a909ec40d492361c'
dbHost = 'http://username:password@hostname:port'
features = 'backup'
name = 'Automation Test'
```

This sets the `sequencePath` to be `/home/pasamio/tfsync` and the 
`backupPath` to be `/home/pasamio/tfsync/backups/test`. If you're on a
Mac, replace the `/home/pasamio` to `/Users/pasamio` with `pasamio` 
being your username.

The other lines that you will need to change is the `dbName` and `dbHost`
to match your CouchDB server details. `dbName` is the identifier of 
your TapForms document. You can get this from "Sync" tab within the
"Preferences" panel of your TapForms document or from the "Show document
info" panel in the "Database Documents" screen. `dbHost` are the details
of your CouchDB server instance. If you are using HTTPS, change the URL
format to "https://" and set the port to "6984". If you are using HTTP,
then set the port to be "5984". 

The last line is the `name` which is used for cosmetic log purposes.

## Create directories

If the directories don't exist already, you should create them. If you are
using the standard configuration then something like the following should
work:

`mkdir -p /home/pasamio/tfsync/backups/test`

This should match your `backupPath`.

## Run your first backup

In the `tftools` directory, run the following command:

`php ./backup-db.php`

This should trigger a backup run. For a large database this will take some
time for a smaller database it can be quite quick. Here's a sample run:

```
pasamio@debian-email:~/tftools$ php ./backup-db.php
Using URL http://username:password@localhost:5984/db-b538abdd2fc34e69a909ec40d492361c/_changes?include_docs=true&limit=10&since=0&attachments=true

Found Record -fakecategory-
int(199)
Found Record -alerts-
int(396)
Found Record -favourites-
int(403)
Found Record -uncategorized-
int(198)
Found Record frm-21aba9a77b15448892f0da7e2e1e7300
int(644)
Found Record fld-dce7bd03374540a4955c1474e3f7c5f8
int(764)
Found Record itm-07390453362f4b92be2678ad15f3cc3e
int(604)
Found Record lay-090e5b90410f4deaaacca547ef45b115
int(386)
Found Record itm-f66ee6fc9ce44dcda743f08df03d257c
int(1627)
Found Record fld-077d7d4c5619419abb25c7e513e61697
int(741)
Pending: 7; Last Seq: 23-g1AAAACbeJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuDOZEvFyjAbpyUnGRiaYlNAx5j8liAJEMDkPoPNY0TbJpJkkGqSVIqNn1ZAIPTMRM
Using URL http://username:password@localhost:5984/db-b538abdd2fc34e69a909ec40d492361c/_changes?include_docs=true&limit=10&since=23-g1AAAACbeJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuDOZEvFyjAbpyUnGRiaYlNAx5j8liAJEMDkPoPNY0TbJpJkkGqSVIqNn1ZAIPTMRM&attachments=true

Found Record fld-d800112ef191479b9e5dbc52cb61f3ca
int(750)
Found Record fld-8b943a7b09b845b58867d5ddaf3c4f2c
int(712)
Found Record rec-d796fef3f6af49f7bf6fc1895ad30609
int(434)
Found Record fld-c45a76a8b28b4546821f0a76d6076621
int(718)
Found Record _design/tfscript
int(370)
Found Record fld-6ecd7dbcad784799b651945616fc4e26
int(707)
Found Record frm-a311565fe3614c5ca97a3942a2973450
int(496)
Pending: 0; Last Seq: 31-g1AAAACbeJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuDOVEkFyjAbpyUnGRiaYlNAx5j8liAJEMDkPoPNY0bbJpJkkGqSVIqNn1ZAIa3MRs
2019-01-07T02:01:36-08:00
All done
```

Success! At this point we should have a "brick level" backup of our
TapForms database. This means each individual record, and attachment,
has their own file exported out and are individually accessible. In
the `tfsync/backups/test` directory you should see the hashed
directory structure:

```
pasamio@debian-email:~/tfsync/backups/test$ ls -lha
total 76K
drwxr-xr-x 19 pasamio pasamio 4.0K Jan  7 02:04 .
drwxr-xr-x  4 pasamio pasamio 4.0K Jan  7 02:01 ..
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 20
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 33
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 66
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 69
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 6f
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 73
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 75
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 7a
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 9d
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 bf
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 c6
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 ca
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 cb
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 d4
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 e1
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 e4
drwxr-xr-x  3 pasamio pasamio 4.0K Jan  7 02:01 fe
```

## Setting up git backup

Our next step is to set up the GIT repo to retain the hourly backups.
GIT is used in a slightly different way where each backup is stored as
it's own branch. This means that shared objects do not increase our
space requirements and we can effectively prune the backups.

The first step is to decide a destination to put the backups, let's
use our existing directory structure and create a new `gitbackup`
directory:

`mkdir /home/pasamio/tfsync/gitbackup`

Once we've done this, run the `bin/gitsetup.sh` command to create
a new backup:

```
$ bin/gitsetup.sh 
Enter source directory [default: /usr/local/var/tfsync/backups]: /home/pasamio/tfsync/backups
Enter destination directory [default: /usr/local/var/gitbackup]: /home/pasamio/tfsync/gitbackup
Enter backup name: test
Source: /home/pasamio/tfsync/backups/test
Destination: /home/pasamio/tfsync/gitbackup/test
+ mkdir -p /home/pasamio/tfsync/gitbackup/test
+ cd /home/pasamio/tfsync/gitbackup/test
+ git init --bare
Initialized empty Git repository in /home/pasamio/tfsync/gitbackup/test/
+ echo /home/pasamio/tfsync/backups/test
```

Remember to change the directories from `/home/pasamio` to match your
own paths.

The next step is to copy the `env.sh-dist` file to `env.sh` in the
`configs` directory and change the path from it's default value. It
should instead point to our new backup directory (replacing out the
`/home/pasamio` portion with one relevant to you):

```
BACKUP_BASE=/home/pasamio/tfsync/gitbackup
```

Our `configs` directory should look like this now:

```
pasamio@debian-email:~/tftools$ ls configs
env.sh  env.sh-dist  sample.ini-dist  test.ini
```

Finally we're ready to run our first backup. Run `bin/gitbackup.sh`
in your terminal:

```
$ bin/gitbackup.sh 
GIT Backup started at Mon Jan  7 02:39:53 PST 2019
Backing up /home/pasamio/tfsync/backups/test to /home/pasamio/tfsync/gitbackup/test

Creating new branch...
Switched to a new branch '2019-01-07_0239'

real	0m0.021s
user	0m0.000s
sys	0m0.000s
Adding files...

real	0m0.070s
user	0m0.000s
sys	0m0.008s
Creating commit...
[2019-01-07_0239 (root-commit) 849e71c] Auto commit 2019-01-07_0239
 18 files changed, 17 insertions(+)
 create mode 100644 20/f1/fld-8b943a7b09b845b58867d5ddaf3c4f2c.json
 create mode 100644 33/1d/itm-f66ee6fc9ce44dcda743f08df03d257c.json
 create mode 100644 66/c2/fld-077d7d4c5619419abb25c7e513e61697.json
 create mode 100644 69/e0/-favourites-.json
 create mode 100644 6f/b3/fld-6ecd7dbcad784799b651945616fc4e26.json
 create mode 100644 73/81/frm-a311565fe3614c5ca97a3942a2973450.json
 create mode 100644 75/f7/fld-dce7bd03374540a4955c1474e3f7c5f8.json
 create mode 100644 7a/23/_design/tfscript.json
 create mode 100644 9d/b9/fld-c45a76a8b28b4546821f0a76d6076621.json
 create mode 100644 bf/dc/lay-090e5b90410f4deaaacca547ef45b115.json
 create mode 100644 c6/d2/itm-07390453362f4b92be2678ad15f3cc3e.json
 create mode 100644 ca/4b/rec-d796fef3f6af49f7bf6fc1895ad30609.json
 create mode 100644 cb/7b/-alerts-.json
 create mode 100644 d4/e1/frm-21aba9a77b15448892f0da7e2e1e7300.json
 create mode 100644 d4/e1/frm-21aba9a77b15448892f0da7e2e1e7300/icon
 create mode 100644 e1/a3/-uncategorized-.json
 create mode 100644 e4/7a/fld-d800112ef191479b9e5dbc52cb61f3ca.json
 create mode 100644 fe/57/-fakecategory-.json

real	0m0.011s
user	0m0.000s
sys	0m0.008s
Backup complete for /home/pasamio/tfsync/backups/test to /home/pasamio/tfsync/gitbackup/test
GIT Backup completed at Mon Jan  7 02:39:53 PST 2019
```

All done!

## Setting up crontab

The last step is to configure the computer to automatically run the 
backup from CouchDB and to create the GIT updates.

Use `crontab -e` to add the following entries:

```
# Backup TF databases from CouchDB ten minutes before the hour.
50 * * * *  php /home/pasamio/tftools/backup-db.php > /tmp/backup-db.log 2>&1

# Do git snapshots hourly.
@hourly /home/pasamio/tftools/bin/gitbackup.sh > /tmp/gitbackup.log 2>&1 

# Clean up at 11:50pm 
50 23 * * * /home/pasamio/tftools/bin/gitprune.sh > /tmp/gitprune.log 2>&1
```

Obviously replace `/home/pasamio` with your own directory structure.
This will use the `cron` system (available on Mac and Linux) to run
the backup commands automatically.

## All Done!

At this point you should have regular hourly backups of your TapForms
document. Make some changes and if you re-run the `backup-db.php`
script to see the changes and then watch as GIT creates it's hourly
backup.
