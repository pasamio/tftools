// ========== Managed Fields Start ========== //
// NAME: Managed Fields
// VERSION: 1.0.0
// CHANGELOG:
//   1.0.0: Initial version.
//   1.0.1: Add setIfEmpty option, fix missing record ID and add extra rules option.
/**
 * Managed Fields adds extra flexibility for configuring per field
 * behaviours around enforcing constraints or logging values.
 */

var PARENT_SCRIPT="Managed Fields";
document.getFormNamed("Script Manager").runScriptNamed("Logger");
document.getFormNamed("Script Manager").runScriptNamed("getRecordsFromFormMatchingSearch");


// Field Configuration
var field_configuration_formID = "frm-e88ceecd810745d6977d94e3d318c3b3";
var field_configuration__form_fldID = "fld-599f037114b5476f93fc32f5f9f4b23c"; // text
var field_configuration__field_fldID = "fld-aeb9127d396842c5baf9cb9cf16d014d"; // text
var field_configuration__configuration_fldID = "fld-4191b42336704dafb2820f387bfba847"; // note


// Managed Field Log
var managed_field_log_formID = "frm-56a276c4f5e94ab4a1486a25b3f4d2f0";
var managed_field_log__form_id_fldID = "fld-8686d925e12849e68ff6a3d11d4a0356"; // text
var managed_field_log__record_id_fldID = "fld-010e58a453dd4b0d879cc6e736b8e2f2"; // text
var managed_field_log__field_id_fldID = "fld-1c9f545cd6b64791a56b84c0bc10a9af"; // text
var managed_field_log__timestamp_fldID = "fld-6c102340bd01400a9a238c7b4afbfa6e"; // date_time
var managed_field_log__previous_value_fldID = "fld-4d052270970446c791d754bc0de09b8d"; // note
var managed_field_log__new_value_fldID = "fld-c99bddb260a24b3eae745e7333384c8d"; // note


// Rollups (sample form for debugging)
var rollups_formID = "frm-d9b2e3331e8e48d3b7e3578eb4a00a4d";
var rollups__rollup_date_fldID = "fld-cd1d454672c84bce8103a4267507ca03"; // text
var rollups__marketplace_fldID = "fld-4c9f208bb5ed406489a54a76d4b6cd18"; // text
var rollups__value_fldID = "fld-9eeeff7120db401b830ccec4e06f2bc3"; // number
var rollups__purchases_fldID = "fld-a50ac6a8849042f69df52d09ebc9373e"; // form

if (!TFForm.prototype.getManagedFieldConfig) {
TFForm.prototype._mflog = logger.fork("ManagedFields::TFForm");
TFRecord.prototype._mflog = logger.fork("ManagedFields::TFRecord");

/**
 * getManagedFieldConfig returns the field configuration of the specified field.
 *
 * @param {string} fieldId - ID of the field to retrieve the configuration.
 *
 * @return {Object|undefined} Field configuration if available or undefined if not set.
 */
TFForm.prototype.getManagedFieldConfig = function(fieldId)
{
	console.log("Getting field config for " + this.getId() + "/" + fieldId);
	let fcForm = document.getFormNamed("Managed Field Configuration");
	if (!fcForm)
	{
		throw new Error("Field Configuration form is not installed");
	}
	let searchCriteria = [
		{"key":field_configuration__form_fldID, "value":this.getId()}, 
		{"key":field_configuration__field_fldID, "value":fieldId}
	];

	this._mflog.debug('Search criteria: ' + JSON.stringify(searchCriteria));

	let configurations = getRecordsFromFormMatchingSearch(fcForm.getId(), searchCriteria);

	switch(configurations.length)
	{
		case 0:
			return [];
			break;
		case 1:
			return JSON.parse(configurations[0].getFieldValue(field_configuration__configuration_fldID));
			break;
		default:
			throw new Error(this.getId() + ".getManagedFieldConfig: Multiple configurations for field: " + fieldId);
			break;
	}
	throw new Error(this.getId() + ".getManagedFieldConfig: fallback situation hit for field ID: " + fieldId);
}

/**
 * setManagedFieldConfig updates configuration for a given field.
 *
 * Configuration is one of a number of settings:
 * - append:        Intended for notes fields, append the new value to the current field value.
 * - prepend:       Intended for notes fields, prepend the new value to the current field value.
 * - updateEarlier: Intended for date fields, only update the value if it sets it to an earlier value.
 * - updateLater:   Intended for date fields, only update the value if it sets it to a later value.
 * - log:           Log the transition to the managed form log.
 * - setIfEmpty:    Update the value of the field if it isn't already set.
 *
 * An error will be thrown in the event of a duplicate configuration is detected.
 *
 * @param {string}   fieldId The field ID of the field to set the configuration.
 * @param {string[]} config  An array of configurations for the field.
 *
 * @return {*} New configuration value.
 */
TFForm.prototype.setManagedFieldConfig = function(fieldId, config)
{
	let fcForm = document.getFormNamed("Managed Field Configuration");
	if (!fcForm)
	{
		throw new Error("Field Configuration form is not installed");
	}

	let searchCriteria = [
		{"key":field_configuration__form_fldID, "value":this.getId()}, 
		{"key":field_configuration__field_fldID, "value":fieldId}
	];

	this._mflog.debug('Search criteria: ' + JSON.stringify(searchCriteria));

	let configurations = getRecordsFromFormMatchingSearch(fcForm.getId(), searchCriteria);
	let managedFieldRecord = undefined;

	switch(configurations.length)
	{
		case 0:
			managedFieldRecord = fcForm.addNewRecord();
			managedFieldRecord.setFieldValue(field_configuration__form_fldID, this.getId());
			managedFieldRecord.setFieldValue(field_configuration__field_fldID, fieldId);
			break;
		case 1:
			managedFieldRecord = configurations[0];
			break;
		default:
			throw new Error(this.getId() + ".setManagedFieldConfig: Multiple configurations for field: " + fieldId);
			break;
	}

	let newConfigValue = JSON.stringify(config);
	managedFieldRecord.setFieldValue(field_configuration__configuration_fldID, newConfigValue);
	document.saveAllChanges();
	this._mflog.debug("Managed field record: " + managedFieldRecord);
	this._mflog.debug(JSON.stringify(managedFieldRecord.values));
	return newConfigValue;
}

/**
 * setManagedFieldValue updates a managed field based on the rules if set.
 * Passes through to setFieldValue: Sets the value on the specified field and 
 * optionally disables scripts that would run by default when the field value 
 * changes if the third parameter is false.
 *
 * @param {string}  fieldID    -  The field ID of the field to update.
 * @param {mixed}   value      -  New value to set the field to, this is mixed and inferred based on the underlying type of the field.
 * @param {boolean} runScripts - Controls if scripts are executed after the update. Useful to prevent cycles or unintended updates.  
 * @param {array}   extraRules - Extra rules to run when setting this value.
 *
 * @return {boolean}  If the field was actually updated.
 */
TFRecord.prototype.setManagedFieldValue = function(fieldId, value, runScripts = true, extraRules = [])
{
	this._mflog.debug("setManagedFieldValue: " + this.getId());
	let fieldConfiguration = new Set([...this.form.getManagedFieldConfig(fieldId), ...extraRules]);
	this._mflog.debug("Detected Field Configuration: " + fieldConfiguration);
	if (fieldConfiguration.length == 0)
	{
		this.setFieldValue(fieldId, value, runScripts);
		return true;
	}

	let updateFieldValue = true;

	let currentValue = this.getFieldValue(fieldId);	
	for (config of fieldConfiguration)
	{
		this._mflog.debug("Apply config: " + config);
		switch(config)
		{
			case "append":
				value = (currentValue ? currentValue + "\n\n": "") + value;
				break;
			case "prepend":
				value = value + (currentValue ? "\n\n" + currentValue : "");
				break;
			case "log":
				let logRecord = document.getFormNamed("Managed Field Log").addNewRecord();
				logRecord.setFieldValues({
					[managed_field_log__form_id_fldID]: this.form.getId(),
					[managed_field_log__record_id_fldID]: this.getId(),
					[managed_field_log__field_id_fldID]: fieldId,
					[managed_field_log__previous_value_fldID]: JSON.stringify(currentValue),
					[managed_field_log__new_value_fldID]: JSON.stringify(value),
				});
				document.saveAllChanges();
				break;
			case "updateLater":
				// if the value is less than the current value, don't update the field.
				if (value < currentValue)
				{
					updateFieldValue = false;
				}
				break;
			case "updateEarlier":
				// if the value is greater than the current value, don't update the field.
				if (value > currentValue)
				{
					updateFieldValue = false;
				}
				break;
			case "setIfEmpty":
				console.log(`Current value of ${fieldId}: ${currentValue}`);
				console.log(JSON.stringify(currentValue));
				if (currentValue)
				{
					updateFieldValue = false;
				}
				break;
		}
	}

	if (updateFieldValue) {
		this.setFieldValue(fieldId, value, runScripts);
		return true;
	}

	return false;
}

/**
 * setManagedFieldValues updates fields for a dictionary of values.
 * Iterates through a passed dictionary.
 *
 * @param {dictionary}   newFieldValues - A dictionary of values keyed by their field ID.
 * @param {boolean}      runScripts     - Control if scripts should be executed.
 * @param {list[string]} extraRules     - Extra rules to run when setting this value.
 *
 * @return {dictionary} A dictionary of booleans for the values of each field ID.
 */
TFRecord.prototype.setManagedFieldValues = function(newFieldValues, runScripts = true, extraRules = []) {
	let returnValue = {};
	for (let fieldId in newFieldValues) {
		console.log(fieldId);
		returnValue[fieldId] = this.setManagedFieldValue(fieldId, newFieldValues[fieldId], runScripts, extraRules);
	}
	return returnValue;
}

function EnhancedTFRecord()
{
	let targetForm = document.getFormNamed("Rollups");
	let allRecords = targetForm.getRecords();
	let targetRecord = allRecords[0];
	console.log("Set field configuration: " + targetForm.setManagedFieldConfig(rollups__marketplace_fldID, ["log"]));
	console.log("Set field value: " + targetRecord.setManagedFieldValue(rollups__marketplace_fldID, "new value " + new Date()));
	console.log("Get field value: " + targetRecord.getFieldValue(rollups__marketplace_fldID));

	console.log("Get field value 2: " + JSON.stringify(targetRecord.getFieldValue("fld-9eeeff7120db401b830ccec4e06f2bc3")));
	console.log("Set field value 2: " + targetRecord.setManagedFieldValue("fld-9eeeff7120db401b830ccec4e06f2bc3", "some value", false, ["log", "setIfEmpty"]));
	document.saveAllChanges();
}

if (typeof(PARENT_SCRIPT) === "undefined") {
	EnhancedTFRecord();
}

}
// ========== Managed Fields End ========== //
