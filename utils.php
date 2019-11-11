<?php

defined('TF') or die();

require_once('uuid.php');

/**
 * Generate random TF document ID
 *
 * @param   string  $prefix  Prefix to use for the document ID.
 *
 * @return  string  document ID
 */
function generateDocumentId($prefix='rec')
{
	return $prefix . '-' . str_replace('-', '', \UUID::mint()->string);
}

/**
 * Check if a feature is enabled for a config.
 *
 * @param   array   $config   Configuration array.
 * @param   string  $feature  Name of the feature to validate.
 *
 * @return  boolean  If the feature is enabled in the config.
 */
function hasFeature($config, $feature)
{
	if (isset($config['features']))
	{
		return in_array($feature, array_map('trim', explode(',', $config['features'])));
	}
	return false;
}

/**
 * Return a safely formatted filename
 * - replace out spaces, colons and slashes
 *
 * @param   string  $scriptPath  Path to root directory to store the scripts in.
 * @param   string  $formId      The unique identifier of the form.
 * @param   string  $recordId    The unique identifier of the record.
 * @param   string  $name        The friendly name of the script.
 *
 * @return  string  A formatted path that should be safe for use with the filesystem.
 */
function getScriptPathForRecord($scriptPath, $formId, $recordId, $name)
{
	return sprintf("%s/%s/%s-%s.js", $scriptPath, $formId, $recordId, str_replace(array(' ',':', '/'), '_', $name));
}

/**
 * Mimic file_get_contents with curl
 *
 * @var  $url       string          The URL to download
 * @var  $ch        curl resource   A curl resource to use.
 * @var  $username  string          A username to use.
 * @var  $password  string          A password to use.
 *
 * @return  string  Response body
 */
function file_get_contents_curl($url, $ch, $username = '', $password = '')
{
	/* References:
	 * https://beamtic.com/curl-response-headers
	 * https://stackoverflow.com/questions/8540800/how-to-use-curl-instead-of-file-get-contents
	 * https://stackoverflow.com/questions/18046637/should-i-close-curl-or-not/18046877#18046877
	 * https://stackoverflow.com/questions/9183178/can-php-curl-retrieve-response-headers-and-body-in-a-single-request
	 * https://stackoverflow.com/questions/10589889/returning-header-as-array-using-curl
	 * https://stackoverflow.com/questions/26148701/file-get-contents-ssl-operation-failed-with-code-1-and-more
	 */


	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_HEADER, 1);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

	if ($username && $password) {
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
	}

	$data = curl_exec($ch);

	$request_info = curl_getinfo($ch);

	if ($request_info['http_code'] != 200) {
		return false;
	}
	$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
	$headers = substr($data, 0, $header_size);
	$body = substr($data, $header_size);

	$headers = explode("\r\n", $headers); // The seperator used in the Response Header is CRLF (Aka. \r\n)
	$headers = array_filter($headers);

	$headers = array_map(
		function ($input) {
			return explode(':', $input, 2);
		}, $headers
	);

	return $body;
}

/**
 * Get Tap Forms databases from a CouchDB host.
 *
 * @var $hostname  string  Hostname of the CouchDB host
 *
 * @return array  Array of DB ID's on the host.
 */
function getDatabasesFromHost($hostname)
{
	$ch = curl_init();
	$dbs = json_decode(file_get_contents_curl($hostname . '/_all_dbs', $ch));
	if (empty($dbs)) {
		return array();
	}
	$result = array();
	foreach ($dbs as $db)
	{
		if (strpos($db, 'db-') === 0) {
			$result[] = $db;
		}
	}
	return $result;
}

