Backups
====

There are two backup scripts that are included:

* [Backup DB (Simple)](Scripts/Backup-DB.md)
* [Backup All Revs (Advanced)](Scripts/Backup-AllRevs.md)

The `Backup DB` script is intended to run regularly and is "lossy". It intends to take a snapshot of your databases at a single point in time and will only include changes at the point in time that the backup is run. It is also intended to be paired with a Git repository to do incremental Time Machine style backups.

The `Backup All Revs` script is intended to facilitate recovering potentially lost data. It attempts to pull all of the documents and then all of the revisions available. It is current set up to pull all documents currently active in the database, though in future it's hoped that we can pull recently deleted documents as well.

