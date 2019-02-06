<?php

require_once('uuid.php');

function generateDocumentId()
{
	return 'rec-' . str_replace('-', '', UUID::mint()->string);
}


