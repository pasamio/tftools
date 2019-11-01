# Script Sync

One of the downsides of scripting in Tap Forms is there is no version 
control. This means that if you make a mistake, you have no good way
of going back to the earlier revision to undo your mistake. Script sync
takes care of this by using a CouchDB server to automatically pull any
changes you make to script fields or form scripts and creates local
files that you can version.

In theory this could be combined with `tf-finder.sh` to work with any
Tap Forms instance.

| Option Name | Default | Description |
| ----------- | ------- | ----------- |
| scriptPath | /usr/local/var/tfsync/scripts/sample | Path to the script save path |

Once you have added `scriptPath` to your configuration and added 
`scriptsync` to the `features` setting, running the `script-sync.php` 
file will trigger a sync of your changes. Here's an example of using
a local Tap Forms instance:

```
pancake:tftools pasamio$ php script-sync.php 
Using sequence file: /usr/local/var/tfsync/db-babeb605dc89415388967bbe868c68f6_to_scriptsync_6a961efde5620285bababae9cc7bb0f4
Using URL https://pancake.local.:55221/db-babeb605dc89415388967bbe868c68f6/_changes?include_docs=true&limit=10&since=29243
&attachments=false

Found Record lnk-ba09322cbbb2438fa1ee704bc748db4a
Found Record lnk-cf3f946ce19645de84f7f452e04dadd1
Found Record lnk-1441d55a6a134a3ba11a36e9f58d6969
Found Record lnk-d5ca25c555b54ffc92858efd17cb8126
Found Record lnk-7f250b1e81a74fac8b98e96d4fc10a59
Found Record lnk-06412e62729341c8beb29a61e42f97a8
Found Record lnk-5dd0e54426cd4ea0afdcca7cac679984
Found Record lnk-30a6161f7ed54b4fabad82b1cd336668
Found Record lnk-5bd9fed4df0642d78b7d3aaaa59df839
Found Record lnk-b7b970bb88984e7bbbde1046269695b2
Pending: 10; Last Seq: 29253; Seq File: /usr/local/var/tfsync/db-babeb605dc89415388967bbe868c68f6_to_scriptsync_6a961efde5620285bababae9cc7bb0f4
Using URL https://pancake.local.:55221/db-babeb605dc89415388967bbe868c68f6/_changes?include_docs=true&limit=10&since=29253&attachments=false

Found Record lnk-9aa0132737524e2fb3274e59b16366e1
Found Record lnk-353ff96e9a3c48b992a3d5cf33da780e
Found Record lnk-dd1e584a5e3149e682d92a345ef5dfff
Found Record lnk-fbc4db1d88ad4f6e86ffdecaf97ac4b7
Found Record lnk-04d7d4daf6e54d3baebe58a978210b15
Found Record lnk-0012041b8ac54fe7ac313850044c6934
Found Record rec-c2345ab31b2744b3b3cc3be9e12415ec
Change scr-22322d566ce146ccb64604c4548eae1e is deleted, deleting doc.
Pending: 0; Last Seq: 29263; Seq File: /usr/local/var/tfsync/db-babeb605dc89415388967bbe868c68f6_to_scriptsync_6a961efde5620285bababae9cc7bb0f4
Finished writing scripts to /usr/local/var/tfsync/scripts/wwgallery at 2019-10-31T23:06:08-07:00
All done
```

> Note: if you use a Tap Forms instance directly, you will have to update
> the configuration each time you restart Tap Forms. Because of this, the
> script will rescan the entire Tap Forms instance from scratch as a part
> of the validation. It is recommended you use this with CouchDB.

The scripts will look like this sample:

```
./frm-a311565fe3614c5ca97a3942a2973450
./frm-a311565fe3614c5ca97a3942a2973450/scr-1797514393e44734a16be7532f2cfb29-Logger.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-d2f1fba453ab4a3a93b9582048d8c954-Profiler.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-adaf76c1ba1c453c82b47aed5f72b568-getRecordFromFormWithKey.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-158112dde6344e5299d9a4f0b6329098-addToTableIfMissing.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-f5d0a55143dc4cefa12806510c040243-Currency_Converter.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-4cded9e8314d465fae4a4957076e6078-Form_Logger.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-bf7ed1512dde4607aa727922f8ac49ec-prototype.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-9fcda373e2784feca7082ff6f23d4f1f-setIfEmpty.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-630fed0e35c54e46877cbf12b7104c32-vlookup.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-aa860ae8cad1433080414bfee0502106-Document_Dump.js
./frm-a311565fe3614c5ca97a3942a2973450/scr-4bb1f8e589404641b0b93e6d2125acac-Source_Scraper.js
./frm-2257fec8cf554925bbc11fba548045da
./frm-2257fec8cf554925bbc11fba548045da/scr-52b8154cd4654678859cf83437ba8ae0-Get_Images.js
./frm-2257fec8cf554925bbc11fba548045da/scr-e344bae389b640f6b38229d3ed2dea85-Update_Products.js
./frm-2257fec8cf554925bbc11fba548045da/scr-041361a47fa146ffa3159d6a93d171e7-Update_SKUs_for_Product.js
./frm-0e7731c04f2c40568fdc8d8da64072e1
./frm-0e7731c04f2c40568fdc8d8da64072e1/scr-6221d5adb4c8471cacfd2be77526af1d-New_Script.js
./frm-9e5ccb4d909b4bef9f4820d5d160258d
./frm-9e5ccb4d909b4bef9f4820d5d160258d/fld-1dae589af9be4cbaa798cfb11f1a56e0-Scraper.js
./frm-d9782e8fd97c489a9b8028c2ed48089f
./frm-d9782e8fd97c489a9b8028c2ed48089f/scr-4b261ea090014cc6b397c9cc524a2c48-Populate_Images.js
```

As you can see the files are grouped by their parent form and the scripts 
are formatted with their document ID and also their name is included in the
path as well. This should make it easy to figure out which script you want.
The sync should track renames and deletes of the scripts.