#!/usr/bin/php -n -d error_reporting=-1 -d display_errors=1
<?php

require_once('utils.php');
require_once('lib/TFRecord.php');

if (!isset($argv[1]))
{
	die("Missing path to configuration file! Please call with configuration file!\n Usage: $argv[0] /path/to/file\n");
}

$configFile = $argv[1];

if (!file_exists($configFile))
{
	die("Config file doesn't exist!\n");
}

$config = parse_ini_file($configFile);

$requiredOptions = array('dbName', 'dbHost', 'uploadForm', 'uploadAttachField');
$missingOptions = array();

foreach ($requiredOptions as $requiredOption)
{
	if (!isset($config[$requiredOption]))
	{
		$missingOptions[] = $requiredOption;
	}
}

if (count($missingOptions))
{
	die("The following options need to be set in your config file: " . implode(', ', $missingOptions) . ".\n");
}

$recent = array();

while(!feof(STDIN))	
{
	$filename = rtrim(fgets(STDIN));

	if (empty($filename))
	{
		echo "Read empty line\n";
		continue;
	}

	echo "Read $filename, five second timeout.\n";
	sleep(5);
	if (!file_exists($filename))
	{
		echo "File missing: $filename\n";
		continue;
	}

	if (in_array($filename, $recent))
	{
		echo "Skipping $filename, recently seen.\n";
		continue;
	}

	$recent[] = $filename;

	echo $filename . "\n";
	$base = basename($filename);
	if (strpos($base, '.jpg') === FALSE)
	{
		echo "Not a .jpg file: $filename\n";
		continue;
	}

	$record = new TFRecord($config['dbName'], $config['uploadForm']);

	if (isset($config['uploadCreatedField']))
	{
		$record->setValue($config['uploadCreatedField'], TFRecord::TYPE_DATE, $createdDate);
	}

	$record->addAttachment($config['uploadAttachField'], $filename);
	$data_json = $record->toJson();

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $config['dbHost'] . '/' . $config['dbName'] . '/' . $record->getId());
	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Content-Length: ' . strlen($data_json)));
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data_json);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$response  = curl_exec($ch);
	curl_close($ch);

	print_r($response);
}
