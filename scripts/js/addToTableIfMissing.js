// ========== addToTableIfMissing Start ========== //
// NAME: addToTableIfMissing
// VERSION: 1.0

document.getFormNamed('Script Manager').runScriptNamed('Logger');

/**
 * Add's a key/value pair to a table if and only if it's missing.
 *
 * If you have a key that exists already but with a different value,
 * then this will add another table row for 
 *
 * fieldId:			The field ID of the table field.
 * keyField:		The field ID of the key field in the table field.
 * key:				The value of the key field to check against.
 * valueField:		The field ID of the value field in the table field.
 * value:			The value of the value field to check against.
 *
 * return: Empty return value in all cases.
 */
function addToTableIfMissing(fieldId, keyField, key, valueField, value)
{
	logger.logMessage(`Adding to ${fieldId} with ${key} and ${value}`);

	var table = record.getFieldValue(fieldId);
	for (var index = 0, count = table.length; index < count; index++)
	{
     	var targetKey = table[index].getFieldValue(keyField);
     	var targetValue = table[index].getFieldValue(valueField);

		if (targetKey == key && targetValue == value)
		{
			logger.logMessage(`Found existing value for ${fieldId} with ${key} and ${value}`);
			return;
		}
	}

	var newRecord = record.addNewRecordToField(fieldId);
	newRecord.setFieldValue(keyField, key);
	newRecord.setFieldValue(valueField, value);
	return;
}
// ========== addToTableIfMissing End ========== //
