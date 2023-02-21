// ========== getRecordsFromFormMatchingSearch Start ========== //
// NAME: Get Records From Form Matching Search
// VERSION: 1.0.1
// CHANGELOG:
//   1.0.1: Use custom logger to reduce log spam.

document.getFormNamed('Script Manager').runScriptNamed('Profiler');
document.getFormNamed('Script Manager').runScriptNamed('Logger');

// Check if our global variable has been setup.
if (!indexedMultirecordIndex)
{

grffmslog = logger.fork("getRecordsFromFormMatchingSearch");
grffmslog.info('Create new multirecord index');
var indexedMultirecordIndex = {};

/**
 * Get a record from a linked form matching a given key/value criteria.
 *
 * parentRecord
 * linkedFieldId
 * criterion
 */
function getRecordsFromFormMatchingSearch(formId, criterion)
{
	// Check if our basic parameters are set.
	if (!formId)
	{
		throw new Error(`Missing required parameters formName: "${formId}"`);
	}
	
	profiler.start(`getRecordsFromFormMatchingSearch: ${formId}/${JSON.stringify(criterion)}: start`);
	

	let targetForm = document.getFormWithId(formId);
	if (targetForm == undefined) {
		targetForm = document.getFormNamed(formId);
		if (targetForm == undefined) {
			throw new Error(`Unable to find form ${formId}`);
		}
	}
	
	let matchingRecords = [];
	
	for (let criteria of criterion) {
		let searchKey = [targetForm.getId(), criteria["key"], criteria["value"]].join("_");
		criteria["indexKey"] = searchKey;
		candidateRecords = indexedMultirecordIndex[searchKey];

		if (candidateRecords && criterion.length == 1) {
			grffmslog.debug("Returning match from index");
			return candidateRecords;
		}
	}
	
	for (let candidateRecord of targetForm.getRecords())
	{
		grffmslog.debug(`Evaluating candidate record: ${candidateRecord.getUrl()}`);
		let match = true;
		let criteria = null;
		for (criteria of criterion)
		{	
			grffmslog.debug(JSON.stringify(criteria));
			if (!indexedMultirecordIndex[criteria["indexKey"]]) {
				indexedMultirecordIndex[criteria["indexKey"]] = [];
			}
			indexedMultirecordIndex[criteria["indexKey"]].push(candidateRecord);
			let candidateValue = candidateRecord.getFieldValue(criteria['key']);
			grffmslog.debug(`Test: "${candidateValue}" vs "${criteria['value']}"`);
			match = match && candidateValue == criteria['value'];
			if (!match)
			{
				break;
			}
		}
		
		if (match)
		{
			grffmslog.debug('Matched: ' + candidateRecord.getUrl());
			matchingRecords.push(candidateRecord);
		}
	}
	profiler.end();
	grffmslog.debug("getRecordsFromFormMatchingSearch: " + JSON.stringify(matchingRecords));
	return matchingRecords;
}

}
// ========== getRecordsFromFormMatchingSearch End ========== //

