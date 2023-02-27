// ========== getRecordFromFormWithKey Start ========== //
// NAME: Get Record From From With Key
// VERSION: 1.0.1
// CHANGELOG:
//  1.0.1: Remove log levels and fix debug statement

document.getFormNamed('Script Manager').runScriptNamed('Profiler');

// Check if our global variable has been setup.
if (!indexedRecordIndex)
{
	console.log('Create new index');
	var indexedRecordIndex = {};
}

// Flag for if we've indexed this form already.
if (!indexedRecordState)
{
	console.log('Create new state');
	var indexedRecordState = {};
}

/**
 * Get a record from a form with a key field, optionally creating it if missing.
 * Note: assumes your key field is unique.
 *
 * formName           The name of the source form for the records (required).
 * keyFieldId         The field ID of the key field in the record (required).
 * keyValue           The value to match as the key (required).
 * createIfMissing    Control if a record is created if none is found (default: true).
 * earlyTermination   Control if function terminates as soon as a match is found (default: true).
 * alwaysScanOnMiss   Control if we should assume concurrent access (default: false)
 */
function getRecordFromFormWithKey(formName, keyFieldId, keyValue, createIfMissing = true, earlyTermination = true, alwaysScanOnMiss = false)
{
	// Check if our basic parameters are set.
	if (!formName || !keyFieldId || !keyValue)
	{
		throw new Error(`Missing required parameters ${formName}/${keyFieldId}/${keyValue}`);
	}
	
	profiler.start(`getRecordFromFormWithKey: ${formName}/${keyFieldId}: start`);
	
	// Determine the target form (check if we were given an ID or else assume a name)
	let targetForm = undefined;
	if (formName.match(/frm-/))
	{
		targetForm = document.getFormWithId(formName);
	}
	else
	{
		targetForm = document.getFormNamed(formName);
	}

	// Create a key for this form-field combination.
	// Form+Field is the key.
	let indexedRecordKey = targetForm.getId() + "_" + keyFieldId;

	// Check to see if this particular link field has been setup.
	if (!indexedRecordIndex[indexedRecordKey])
	{
		indexedRecordIndex[indexedRecordKey] = {};
	}

	
	// Short circuit if we have an exact match.
	if (indexedRecordIndex[indexedRecordKey][keyValue])
	{
		profiler.end();
		return indexedRecordIndex[indexedRecordKey][keyValue];
	}

	// No immediate match, check to see if we should scan everything.
	// alwaysScanOnMiss forces this code path each execution.
	// The check to indexedRecordState is if this has been indexed.
	if (alwaysScanOnMiss || !indexedRecordState[indexedRecordKey])
	{
		profiler.start(`getRecordFromFormWithKey: ${formName}/${keyFieldId}: scan records (early termination? ${earlyTermination}; always scan: ${alwaysScanOnMiss}; state: ${indexedRecordState[indexedRecordKey]})`);
		// Brute force search :(
		let records = targetForm.getRecords();

		// Iterate through all of the records and look for a match.
		for (let currentRecord of records)
		{
			// Set up a reverse link for this value.
			let recordKeyValue = currentRecord.getFieldValue(keyFieldId);
			indexedRecordIndex[indexedRecordKey][recordKeyValue] = currentRecord;

			// If this is a match and early termination is setup, return immediately.
			if (earlyTermination && recordKeyValue == keyValue)
			{
				profiler.end(2);
				return currentRecord;
			}
		}

		// Flag this record-field as being indexed.
		indexedRecordState[indexedRecordKey] = true;
		//if (LOGLEVEL <= LOGLEVELS.DEBUG) console.log(indexedRecordState[indexedRecordKey]);
		profiler.end();
	}

	// Check to see if we got a match here and return if the key exists.
	if (indexedRecordIndex[indexedRecordKey][keyValue])
	{
		profiler.end();
		return indexedRecordIndex[indexedRecordKey][keyValue];
	}
	else if (createIfMissing)
	{
		profiler.start(`getRecordFromFormWithKey: ${formName}/${keyFieldId}: create new record`);
		// If createIfMissing is set, create a new record.
		// Note: it's expected the caller will call document.saveAllChanges();
		let newRecord = targetForm.addNewRecord();
		// Set the key value to our search value.
		newRecord.setFieldValue(keyFieldId, keyValue);
		// Link this up to save us another lookup in future.
		indexedRecordIndex[indexedRecordKey][keyValue] = newRecord;
		// And now we return the new record. 
		profiler.end(2);
		return newRecord;
	}
	
	// If we didn't find anything, return undefined.
	profiler.end();

	return undefined;
}
// ========== getRecordFromFormWithKey End ========== //
