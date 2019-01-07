// ========== setIfEmpty Start ========== //
// NAME: setIfEmpty
// VERSION: 1.0
/**
 * Set a field if it is currently empty or matches the default value.
 *
 * target: 			The record to use (TFFormEntry object)
 * fieldId:			The field ID (e.g. `fld-hash`) to set.
 * value:			The value to set in the field.
 * defaultValue:	The default value of the field. 
 *
 * return: boolean true if set or boolean false if unset.
 */
function setIfEmpty(target, fieldId, value, defaultValue)
{
	var current = target.getFieldValue(fieldId);
	if ((!current || current == defaultValue) && current != value)
	{
		console.log('setIfEmpty passed for ' + fieldId + ', setting to: ' + value);
		target.setFieldValue(fieldId, value);
		return true;
	}
	else
	{
		console.log('setIfEmpty failed for ' + fieldId + ', skipping.');
		return false;
	}
}
// ========== setIfEmpty End ========== //
