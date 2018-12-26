#!/usr/bin/php -n -d error_reporting=-1 -d display_errors=1
<?php

ini_set('error_reporting', -1);
ini_set('display_errors', 1);

foreach(glob(realpath(dirname(__FILE__)) . '/configs/*.ini') as $configFile)
{
	processUpdate(parse_ini_file($configFile));
}


die("All done\n");

function getField($fieldKey, $config)
{
	static $fields = array();

	if (!isset($fields[$fieldKey]))
	{
		$field = json_decode(file_get_contents(sprintf('%s/%s/%s', $config['dbHost'], $config['dbName'], $fieldKey)));
		$fields[$fieldKey] = $field;
	}

	return $fields[$fieldKey];
}



function processUpdate($config)
{
	extract($config);

	$sequenceFile = sprintf('%s/%s_to_%s_%s', $sequencePath, $dbName, $esIndex, md5($dbHost.$esHost));
	$since = "0";
	if (file_exists($sequenceFile))
	{
		printf("Using sequence file: %s\n", $sequenceFile);
		$lastSince = file_get_contents($sequenceFile);
		$since = !empty($lastSince) ? $lastSince : $since;
	}

	$url = sprintf('%s/%s/_changes?include_docs=true&limit=100&since=%s', $dbHost, $dbName, $since);
	printf("Using URL %s\n\n", $url);
	$data = file_get_contents($url) or die("Unable to connect to CouchDB\n");
	$response = json_decode($data);
	$pending = $response->pending;
	$changes = $response->results;
	$lastSeq = $response->last_seq;

	foreach ($changes as $change)
	{
		if (isset($change->deleted))
		{
			printf("Change %s is deleted, deleting doc.\n", $change->id);
			$url = sprintf('%s/%s/_doc/%s', $esHost, $esIndex, $change->id);
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			$response  = curl_exec($ch);
			var_dump($response);
			curl_close($ch);

			continue;	
		}

		if (isset($change->doc->type))
		{
			printf("Document Type: %s\n", $change->doc->type);
			if (strpos($change->id, 'rec-') !== false)
			{
				printf("Found Record %s\n", $change->id);
				if (isset($change->doc->_attachments))
				{
					unset($change->doc->_attachments);
				}

				if (!isset($change->doc->values))
				{
					printf("Found empty record '%s', skipping...\n", $change->id);
					continue;
				}

				foreach((array)$change->doc->values as $key => $value)
				{
					// Skip the -attr fields.
					if (preg_match('/-attr$/', $key))
					{
						continue;
					}

					// Skip empty values.
					// TODO: This is working around an issue with date fields which should be an object
					//       but are actually empty strings for some reason. Should build a more generic
					//       field based validation setting.
					if (empty($value))
					{
						continue;
					}

					// Fix timestamp field.
					if (is_object($value) && isset($value->alert))
					{
						$value->alert = (bool)$value->alert;
					}

					$field = getField($key, $config);

					if (isset($field->tableField))
					{
						$parentField = getField($field->tableField, $config);
						if ($parentField->form != $change->doc->form)
						{
							printf("Warning: Field '%s' is not a part of this form! Document Form: %s; Field Form: %s; Record: %s\n", $key, $change->doc->form, $field->form, $change->doc->_id);
							continue;
						}
					}
					elseif ($field->form != $change->doc->form)
					{
						printf("Warning: Field '%s' is not a part of this form! Document Form: %s; Field Form: %s; Record: %s\n", $key, $change->doc->form, $field->form, $change->doc->_id);
						continue;
					}

					// Skip photo fields; only the filename is indexable and that's of dubious value.
					if (in_array($field->fieldType, array('photo')))
					{
						continue;
					}

					if (isset($field->jsonParameterName) && !empty($field->jsonParameterName))
					{
						$change->doc->{$field->jsonParameterName . '_' . $key} = $value;
					}
					else
					{
						$change->doc->$key = $value;
					}
				}

				unset($change->doc->values);

				$change->doc->id = $change->doc->_id;
				$change->doc->rev = $change->doc->_rev;
				unset($change->doc->_id);
				unset($change->doc->_rev);
				print_r($change->doc);
				$data_json = json_encode($change->doc);

				$url = sprintf('%s/%s/_doc/%s', $esHost, $esIndex, $change->doc->id);
				$ch = curl_init();
				curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
				curl_setopt($ch, CURLOPT_URL, $url);
				curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Content-Length: ' . strlen($data_json)));
				curl_setopt($ch, CURLOPT_POSTFIELDS,$data_json);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				$response  = curl_exec($ch);
				$responseObj = json_decode($response);
				if (isset($responseObj->error))
				{
					file_put_contents(
						sprintf('%s/errors/%s.json', realpath(dirname(__FILE__)), $change->doc->id), 
						json_encode(array('doc' => $change->doc, 'error' => $responseObj))
					);
				}
				var_dump($response);
				curl_close($ch);
			}
		}
		else
		{
			printf("Unknown document format for record %s, skipping.\n", $change->id);
		}

	}

	file_put_contents($sequenceFile, $lastSeq);
	printf("Pending: %d; Last Seq: %s\n", $pending, $lastSeq);
}

