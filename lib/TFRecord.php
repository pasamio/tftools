<?php

class TFRecord
{
	private $_data = array();

	const TYPE_TEXT 	=  1;
	const TYPE_NUMBER	=  2;
	const TYPE_DATE 	=  3;
	const TYPE_TIME 	=  4;
	const TYPE_DATETIME 	=  5;
	const TYPE_AUDIO 	=  6;
	const TYPE_CALCULATION	=  7;
	const TYPE_CHECKMARK	=  8;
	const TYPE_CONTACT	=  9;
	const TYPE_DRAWING	= 10;
	const TYPE_EMAIL	= 11;
	const TYPE_FILEATTACH   = 12;
	const TYPE_LINKTOFORM	= 13;
	const TYPE_LINKFROMFORM	= 14;
	const TYPE_LOCATION	= 15;
	const TYPE_NOTE		= 16;
	const TYPE_PHONENUMBER	= 17;
	const TYPE_PHOTO	= 18;
	const TYPE_RATING	= 19;
	const TYPE_SCRIPT	= 20;
	const TYPE_SECTION	= 21;
	const TYPE_SIGNATURE	= 22;
	const TYPE_TABLE	= 23;
	const TYPE_WEBSITE	= 24;
	const TYPE_CREATED	= 25;
	const TYPE_MODIFIED	= 26;

	public function __construct($db, $form, $id = null)
	{
		$createdDate = $createdDate ? $createdDate : date('c');
		$this->_data = array(
			'_id' => generateDocumentId(),
			'dateCreated' => $createdDate,
			'dateModified' => $createdDate,
			'dbID' => $db,
			'form' => $form,
			'type' => $form,
			'values' => array(),
			'_attachments' => array()
		);
	}

	public function getRecord()
	{
		return $this->_data;
	}

	public function addAttachment($fieldId)
	{

		$imageDetails = getimagesize($filename);
		$entry = array(
			'dimensions' =>  sprintf("{%d, %d}", $imageDetails[0], $imageDetails[1]),
			'filename' => $base,
			'mimetype' => $imageDetails['mime']
		);
	
		$this->_data['values'][$fieldId][] = $entry;
		
		$this->_data['_attachments'][$base] = array(
			'content_type' => $imageDetails['mime'],
			'data' => base64_encode(file_get_contents($filename))
		);

		return $this;
	}

	public function setValue($fieldId, $value, $type = 'text')
	{
		switch ($type)
		{
			case TYPE_CREATED:
				$this->_data->dateCreated = $value;
				break;
			case TYPE_MODIFIED:
				$this->_data->dateModified = $value;
				break;
			case TYPE_DATE:
				$this->_data->values[$fieldId] = array('date' => $value);
			default:
				$this->_data->values[$fieldId] = $value;
				break;
		}

		return $this;
	}

	public function toJson()
	{
		return json_encode($this->_data);
	}

	public function getId()
	{
		return $this->_data->_id;
	}
}
