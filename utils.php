<?php

defined('TF') or die();

require_once('uuid.php');

function generateDocumentId()
{
	return 'rec-' . str_replace('-', '', UUID::mint()->string);
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

