<?php

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

