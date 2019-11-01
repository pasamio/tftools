#!/usr/bin/php  -n -d error_reporting=-1 -d display_errors=1 -d memory_limit=1G
<?php

define('TF', 1);
require_once(realpath(dirname(__FILE__)) . '/utils.php');

ini_set('error_reporting', -1);
ini_set('display_errors', 1);

foreach(glob(realpath(dirname(__FILE__)) . '/configs/*.ini') as $configFile)
{
	$config = parse_ini_file($configFile);
	if (!hasFeature($config, 'scriptsync'))
	{
		printf("scriptsync not enabled for config: %s\n", $configFile);
		continue;
	}

	if (!isset($config['scriptPath']))
	{
		printf("scriptPath not set for config: %s\n", $configFile);
		continue;
	}
	processUpdate($config);

	printf("Finished writing scripts to %s at %s\n", $config['scriptPath'], date('c'));
}

die("All done\n");

function deleteScriptFiles($scriptPath, $scriptId, $formId = null)
{
	$candidates = glob(sprintf("%s/*/%s*", $scriptPath, $scriptId));
	foreach ($candidates as $candidate)
	{
		unlink($candidate);
	}
}

function processUpdate($config)
{
	extract($config);

	if (!file_exists($scriptPath))
	{
		$res = mkdir($scriptPath, 0777, true);
		if (!$res)
		{
			printf("Unable to create script path\n");
			return;
		}
	}

	$arrContextOptions=array(
	    "ssl"=>array(
		"verify_peer"=>false,
		"verify_peer_name"=>false,
	    ),
	);


	$sequenceFile = sprintf('%s/%s_to_scriptsync_%s', $sequencePath, $dbName, md5($dbHost.$backupPath));
	$since = "0";
	$pending = 1;
	if (file_exists($sequenceFile))
	{
		printf("Using sequence file: %s\n", $sequenceFile);
		$lastSince = file_get_contents($sequenceFile);
		$since = !empty($lastSince) ? $lastSince : $since;
	}

	$dbRootUrl = sprintf('%s/%s', $dbHost, $dbName);
	$dbDetails = json_decode(file_get_contents($dbRootUrl, false, stream_context_create($arrContextOptions))) or die("Unable to connect to CouchDB\n");

	while ($pending > 0)
	{
		$url = sprintf('%s/%s/_changes?include_docs=true&limit=10&since=%s&attachments=false', $dbHost, $dbName, $since);
		printf("Using URL %s\n\n", $url);
		$data = file_get_contents($url, false, stream_context_create($arrContextOptions)) or die("Unable to connect to CouchDB\n");
		$response = json_decode($data);
		$changes = $response->results;
		$lastSeq = $response->last_seq;
		$pending = isset($response->pending) ? $response->pending : $dbDetails->update_seq - $lastSeq;
		$since = $lastSeq;

		if ($pending == -1)
		{
		}

		foreach ($changes as $change)
		{
			if (isset($change->deleted))
			{
				printf("Change %s is deleted, deleting doc.\n", $change->id);
				deleteScriptFiles($scriptPath, $change->id);
				continue;	
			}

			printf("Found Record %s\n", $change->id);
			if (!isset($change->doc->type))
			{
				printf("Record missing type, skipping.\n");	
				continue;
			}

			switch($change->doc->type)
			{
				case 'TFField':
					if ($change->doc->fieldType != 'script')
					{
						continue;
					}
					$targetFilename = getScriptPathForRecord($scriptPath, $change->doc->form, $change->doc->_id, $change->doc->name);
					printf("Target Filename: '%s'\n", $targetFilename);
					if (!file_exists(dirname($targetFilename)))
					{
						mkdir(dirname($targetFilename), 0777, true);
					}
					deleteScriptFiles($scriptPath, $change->doc->_id);
					file_put_contents($targetFilename, $change->doc->script);
					break;
				case 'TFScript':
					$targetFilename = getScriptPathForRecord($scriptPath, $change->doc->form, $change->doc->_id, $change->doc->name);
					printf("Target Filename: '%s'\n", getScriptPathForRecord($scriptPath, $change->doc->form, $change->doc->_id, $change->doc->name));
					if (!file_exists(dirname($targetFilename)))
					{
						mkdir(dirname($targetFilename), 0777, true);
					}
					deleteScriptFiles($scriptPath, $change->doc->_id);
					file_put_contents($targetFilename, $change->doc->code);
					break;
			}
		}
		printf("Pending: %d; Last Seq: %s; Seq File: %s\n", $pending, $lastSeq, $sequenceFile);
		file_put_contents($sequenceFile, $lastSeq);
	}
}

