// NAME: Aggregate Form
// VERSION: 1.0
document.getFormNamed("Script Manager").runScriptNamed("md5sum");

/**
 * Aggregate form takes data from a source form and sums it together into a target form.
 *
 * This method is used to sum values together from a source form and either return it as
 * data or to populate another form. For the data return, it supports it's own internal 
 * object form, a simpler JSON format or CSV. When using the other form or JSON formats,
 * the fieldMap ID's are used to remap the field ID's. 
 *
 * sourceForm is expected to be a TFForm object (or similar) that supports getRecords to
 * retrieve a set of records to process.
 *
 * targetForm is expected to be a TFForm object that supports adding new records to save
 * aggregate records. If targetForm is set to a falsy value, results will not be saved
 * back to the Tap Forms document.
 *
 * The fieldMap defines the mapping of source field ID to destination field ID. At a 
 * minimum fieldMap needs to specify one key field to be used in addition to the
 * aggregateField. An arbitrary number of key fields can be added to the map and will be
 * used to define keys for records.
 *
 * The transformerMap is used to define transformer functions for source fields. This is
 * useful for taking a complex field type like a date or a location and then turn it into
 * a string that can be used as a part of a key. 
 * 
 * The options map controls behaviour configuration for the function. By default the
 * internal aggregation structure is returned and if targetForm is provided, new records
 * are created in the form.
 *
 * For more details about usage refer to this Tap Forms forum post:
 * https://www.tapforms.com/forums/topic/total-value-of-a-table-field/#post-46670
 *
 * @param {TFForm} sourceForm - The text to display in the dialog for the confirmation.
 * @param {TFForm} targetForm - The prefix to display for the text box of the prompt.
 * @param {string} aggregateField - The field ID in the source form to use for aggregation.
 * @param {object} fieldMap - hash mapping of source field ID to target field ID.
 * @param {object} [transformerMap={}] - mapping of source field ID to transformation function, useful for formatting dates.
 * @param {object} [options={}] - options for controlling the behaviour of the function. Boolean keyed for logcsv, hashedrecord, returncsv and return json.
 *
 * @return {(string|object)}  The internal object representation of the aggregated data or the data in CSV/JSON format.
 */
function aggregateForm(sourceForm, targetForm, aggregateField, fieldMap, transformerMap = {}, options = {}) {
	for (let defaultKey in defaults = {
		'logcsv': false,
		'hashedrecord': false,
		'returncsv': false,
		'returnjson': false,
	}) {
		options[defaultKey] = options[defaultKey] !== undefined ? options[defaultKey] : defaults[defaultKey];
	}

	// check we have a source form, a field to aggregate and a mapping field.
	if (!sourceForm) {
		throw new ReferenceError("Unset source form");
	}
	
	if (!aggregateField) {
		throw new ReferenceError("Unset aggregate field");
	}
	
	if (!fieldMap) {
		throw new ReferenceError("Unset field map");
	}
	
	if (fieldMap.length < 2) {
		throw new ReferenceError("Field map must have at least two entries (aggregate field and key)");
	}
	
	let rollups = {};
	let destField = fieldMap[aggregateField];

	// iterate to all of the records in the form
	for (var rec of sourceForm.getRecords()) {
		//console.log(rec.getId());

		let keyFields = [];
		let aggEntry = 0;
		let keyEntries = {};
		
		for (let srcField in fieldMap) {
			//console.log(srcField + " => " + fieldMap[srcField])
			let value = rec.getFieldValue(srcField);
			if (transformerMap[srcField]) {
				//console.log("Transforming...");
				value = transformerMap[srcField](value, rec);
			}
			//console.log(value);
			
			if (srcField == aggregateField) {
				aggValue = value;
			} else {
				keyEntries[srcField] = value;
				keyFields.push(value);	
			}
		}

		var rollupKey = keyFields.join(",");

		// Rollup to this key, add to the existing value or set it if not set.
		if (!rollups[rollupKey]) {
			rollups[rollupKey] = {};
			for (let srcField in fieldMap) {
				rollups[rollupKey][fieldMap[srcField]] = keyEntries[srcField];
				rollups[rollupKey][destField] = aggValue;
			}
		} else {
			rollups[rollupKey][destField] += aggValue;
		}
	}
	
	let retval = [];

	// log to console the aggregated values.
	for (let rollupKey in rollups) {
		if (options['logcsv']) {
			console.log(rollupKey + "," + rollups[rollupKey][destField]);
		}
		
		if (options['returncsv']) {
			retval.push(rollupKey + "," + rollups[rollupKey][destField]);
		}
		
		if (targetForm) {
			let destRecord;
			if (options['hashedrecord']) {
				let targetKey = "rec-" + md5(sourceForm.getId()+targetForm.getId()+rollupKey);
				destRecord = targetForm.getRecordWithId(targetKey);
				if (!destRecord) {
					destRecord = targetForm.addNewRecordWithId(targetKey);
				}
			} else {
				destRecord = targetForm.addNewRecord();
			}
			destRecord.setFieldValues(rollups[rollupKey]);
		}
	}
	document.saveAllChanges();
	
	if (options['returnjson']) {
		return JSON.stringify(Object.values(rollups));
	}
	
	if (options['returncsv']) {
		return retval.join("\n");
	}
	
	return rollups;
}
