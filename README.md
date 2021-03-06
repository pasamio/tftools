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

Check out the [Getting Started guide](docs/GettingStarted.md) for a
quick walkthrough of configuring the backup script.

# Scripts

* [Backups](docs/Backups.md)
* [Build Tree](docs/Scripts/BuildTree.md)
* [ElasticSearch](docs/Scripts/ElasticSearch.md)
* [Script Sync](docs/Scripts/ScriptSync.md)

# Notes

Tap Forms Copyright ©2019 Tap Zapp Software Inc.

