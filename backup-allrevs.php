#!/usr/bin/php -d error_reporting=-1 -d display_errors=1 -d memory_limit=1G -n
<?php

ini_set('error_reporting', -1);
ini_set('display_errors', 1);
define('TF', 1);

require_once('utils.php');

/**
 * Backup a database to disk getting all revisions.
 *
 * @var  $hostname     string  The hostname to connect to (e.g. http://localhost:5984) with protocol and no trailing slash.
 * @var  $dbID         string  The database ID to use on this host.
 * @var  $destination  string  Backup destination path.
 * @var  $perHost      string  Flag to control if files are written per hostname. Useful for conflict detection.
 */
function backupDatabase($hostname, $dbID, $destination, $perHost = false)
{
	$arrContextOptions=array(
		"ssl"=>array(
			"verify_peer"=>false,
			"verify_peer_name"=>false,
		),
	);  

	$baseDir = $destination . '/' . $dbID;

	if ($perHost) {
		$hostParts = parse_url($hostname);
		if (!$hostParts) {
			echo "Unable to parse host from URL: $hostname\n";
			return;
		}
		$baseDir .= '/' . $hostParts['host'];
	}

	$ch = curl_init();

	@mkdir($baseDir, 0777, true);

	$allDocs = $hostname . '/' . $dbID . '/_all_docs';
	echo "Getting documents from $allDocs\n";
	$all_docs = json_decode(file_get_contents($allDocs, false, stream_context_create($arrContextOptions)));

	if (empty($all_docs)) {
		echo "All Docs response was empty!\n";
		return;
	}

	foreach($all_docs->rows as $row)
	{
		$recordDir = $baseDir . '/' . $row->id;
		@mkdir($recordDir);

		$recordUrl = $hostname . '/'. $dbID . '/' . str_replace('/', '%2F', $row->id) . '?revs=true';
		echo "Getting revisions from $recordUrl\n";
		$recordJSON = file_get_contents_curl($recordUrl, $ch);

		if ($recordJSON === false) {
			die("Record JSON was false, this shouldn't happen.\n");
		}

		$record = json_decode($recordJSON);

		$start = $record->_revisions->start;

		foreach ($record->_revisions->ids as $index => $revision)
		{
			$offset = $start - $index;
			$key = $offset . '-' . $revision;
			$revisionUrl = $hostname . '/'. $dbID . '/' . $row->id . '?rev='  . $key;

			$destination = $recordDir . '/' . $key . '.json';

			if (!file_exists($destination)) {
				echo "Getting revision from $revisionUrl\n";
				$revision = file_get_contents_curl($revisionUrl, $ch);
				if ($revision === false) {
					echo "Skipping entry, error from request.\n";
				}
				else
				{
					echo "Writing to disk: $destination\n";
					file_put_contents($destination, $revision);
				}
			}
			else
			{
				echo "Skipped location, file exists: $destination.\n";
			}
		}
	}

	curl_close($ch);
}


if (isset($argv[1]))
{
	if(is_dir($argv[1]))
	{
		$backupRoot = $argv[1];
	}
	else
	{
		die("Backup path is not a directory: $argv[1]\n");
	}
}
else
{
	$backupRoot = getcwd() . '/backups';
}

$configIniFile = $backupRoot . '/config.ini';
if (file_exists($configIniFile))
{
	echo "Loading config.ini file\n";
	extract(parse_ini_file($configIniFile));
}

if (!isset($couchHosts))
{
	$couchHosts = array();
}

if (!isset($perHost))
{
	$perHost = false;
}

if (!isset($instancePath))
{
	$instancePath = '/tmp/tf-hosts';
}

echo "Settings:\n";
echo "Backup Root: $backupRoot\n";
echo "Copnfig INI file: $configIniFile\n";
echo "Instance Path: $instancePath\n";
echo "Couch Hosts: " . implode(', ', $couchHosts) . "\n";
echo "Per Host: " . ($perHost ? 'Yes' : 'No') . "\n";
echo "=====================\n\n";
die();

foreach ($couchHosts as $host)
{
	foreach(getDatabasesFromHost($host) as $db)
	{
		backupDatabase($host, $db, $backupRoot, $perHost);
	}
}

$instances = file($instancePath);
foreach ($instances as $instance)
{
	$pieces = explode('/', $instance);
	backupDatabase($pieces[0] . '//' . $pieces[2], trim($pieces[3]), $backupRoot, $perHost);
}
