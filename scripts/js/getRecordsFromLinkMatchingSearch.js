// ========== getRecordsFromLinkMatchingSearch Start ========== //
// NAME: Get Records From Link Matching Search
// VERSION: 1.0

document.getFormNamed('Script Manager').runScriptNamed('Profiler');

/**
 * Get a record from a linked form matching a given key/value criteria.
 * 
 * This method matches an array of `criterion` that contain `key`/`value` pairs
 * where the `key` maps to a field ID and the `value` is used to confirm the matches.
 *
 * This is currently operating as an "OR" filter.
 *
 * @param  {string}  parentRecord  - A TFRecord instance to use as a basis.
 * @param  {string}  linkedFieldId - The field ID of the "Link to Form" field.
 * @param  {array}   criterion     - An array of objects with `key` and `value` fields.
 *
 * @return  {Array}  Array of matching TFRecord instances.
 */
function getRecordsFromLinkMatchingSearch(parentRecord, linkedFieldId, criterion)
{
	// Check if our basic parameters are set.
	if (!linkedFieldId || !criterion)
	{
		throw new Error(`Missing required parameters ${linkedFieldId}/${criterion}`);
	}
	
	profiler.start(`getRecordsFromLinkMatchingSearch: ${linkedFieldId}/${JSON.stringify(criterion)}: start`);
	
	let matchingRecords = [];
	let candidateRecord = null;
	
	for (candidateRecord of parentRecord.getFieldValue(linkedFieldId))
	{
		let match = false;
		let criteria = null;
		for (criteria of criterion)
		{
			//console.log(JSON.stringify(criteria));
			let candidateValue = candidateRecord.getFieldValue(criteria['key']);
			//console.log(`Test: "${candidateValue}" vs "${criteria['value']}"`);
			if (candidateValue != criteria['value'])
			{
				break;
			}
			//console.log('Matched!');
			match = true;
		}
		
		if (match)
		{
			matchingRecords.push(candidateRecord);
		}
	}
	profiler.end();
	return matchingRecords;
}
// ========== getRecordsFromLinkMatchingSearch End ========== //
