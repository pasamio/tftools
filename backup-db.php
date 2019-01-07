#!/usr/bin/php  -n -d error_reporting=-1 -d display_errors=1 -d memory_limit=1G
<?php

ini_set('error_reporting', -1);
ini_set('display_errors', 1);

/**
 * Backup Tool for CouchDB
 *
 * This tool uses the CouchDB changes API to identify changes to a 
 * database and replicate it locally to the filesystem. This is
 * intended to be used with a secondary backup system that will
 * enable a primitive revisioning to occur (e.g. by using Time
 * Machine or by the provided GIT scripts). This can then be used
 * to restore previous versions or recover accidentally deleted
 * entries.
 */


// Get all of the configs and process updates for them.
foreach(glob(realpath(dirname(__FILE__)) . '/configs/*.ini') as $configFile)
{
	processUpdate(parse_ini_file($configFile));
}


printf("%s\n", date('c'));
die("All done\n");

/**
 * Delete an entire tree recursively.
 *
 * @param    string  $dir  The directory path to delete.
 *
 * @return   bool  The result of the final rmdir operation on this directory.
 */  
function delTree($dir) { 
	$files = array_diff(scandir($dir), array('.','..')); 
	foreach ($files as $file) { 
		(is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file"); 
	} 
	return rmdir($dir); 
} 

/**
 * Returns a hashed destination path for a record ID.
 * This is to have hashed directories to avoid megadirectories.
 *
 * @param   string  $backupPath     Destination path for backup.
 * @param   string  $id             Unique Identifier of the record.
 * @param   int     $depth       The depth of the hashing.
 *
 * @return  string  The desintation path to use for this record.
 */
function getPathForRecord($backupPath, $id, $depth = 2)
{
	$hash = md5($id);
	if ($depth > 15)
	{
		$depth = 15;
	}
	$path = $backupPath;
	for ($i = 0; $i < $depth; $i++)
	{
		$path .= '/' . substr($hash, $i * 2, 2);
	}
	return $path;
}

/**
 * Process updates for a given configuration.
 *
 * This script will work through changes from a given CouchDB instance
 * and apply them to a local directory extracting out the documents to
 * JSON files and storing exporting attachments.
 *
 * @param   array  $config  Soure configs.
 */
function processUpdate($config)
{
	extract($config);

	if (!file_exists($backupPath))
	{
		mkdir($backupPath, 0777, true);
	}

	$sequenceFile = sprintf('%s/%s_to_backup_%s', $sequencePath, $dbName, md5($dbHost.$backupPath));
	$since = "0";
	$pending = 1;
	if (file_exists($sequenceFile))
	{
		printf("Using sequence file: %s\n", $sequenceFile);
		$lastSince = file_get_contents($sequenceFile);
		$since = !empty($lastSince) ? $lastSince : $since;
	}

	while ($pending > 0)
	{
		$url = sprintf('%s/%s/_changes?include_docs=true&limit=10&since=%s&attachments=true', $dbHost, $dbName, $since);
		printf("Using URL %s\n\n", $url);
		$data = file_get_contents($url) or die("Unable to connect to CouchDB\n");
		$response = json_decode($data);
		$pending = $response->pending;
		$changes = $response->results;
		$lastSeq = $response->last_seq;
		$since = $lastSeq;

		foreach ($changes as $change)
		{
			$documentPath = getPathForRecord($backupPath, $change->id);
			if (!file_exists($documentPath))
			{
				mkdir($documentPath, 0777, true);
			}

			if (isset($change->deleted))
			{
				printf("Change %s is deleted, deleting doc.\n", $change->id);
				$recPath = sprintf('%s/%s.json', $documentPath, $change->id);
				$recPathCompressed = sprintf('%s/%s.json.gz', $documentPath, $change->id);
				$attachments = sprintf('%s/%s', $documentPath, $change->id);
				file_exists($recPath) ? var_dump(unlink($recPath)) : null;
				file_exists($recPathCompressed) ? var_dump(unlink($recPathCompressed)) : null;
				file_exists($attachments) ? var_dump(delTree($attachments)) : null;

				continue;	
			}

			printf("Found Record %s\n", $change->id);

			// Drop attachments.
			if (isset($change->doc->_attachments))
			{
				$attachmentRoot = sprintf("%s/%s", $documentPath, $change->id);
				mkdir ($attachmentRoot);
				foreach ($change->doc->_attachments as $filename=>$attachment)
				{
					file_put_contents($attachmentRoot . '/' . $filename, base64_decode($attachment->data)); 
					unset($change->doc->_attachments->$filename->data);
				}
			}
			$data_json = json_encode($change->doc);

			$url = sprintf('%s/%s.json', $documentPath, $change->id);
			if (isset($compressBackup) && $compressBackup)
			{
				$url .= '.gz';
				$data_json = gzencode($data_json);
			}

			// If the directory doesn't exist, create it!
			if (!file_exists(dirname($url)))
			{
				mkdir(dirname($url), 0777, true);
			}
			$result = file_put_contents($url, $data_json);
			var_dump($result);
		}
		printf("Pending: %d; Last Seq: %s\n", $pending, $lastSeq);
		file_put_contents($sequenceFile, $lastSeq);
	}
}

