// ========== Configuration Start ========== //
// NAME: Configuration
// VERSION: 1.0.0

document.getFormNamed('Script Manager').runScriptNamed('getRecordFromFormWithKey');

/**
 * Configuration module provides leverages a "Configuration" field in the
 * "Script Manager" form with the "Script Name" field used as a key.
 */
if (config == undefined)
var config = (function() {
	var script_name_id = 'fld-8b943a7b09b845b58867d5ddaf3c4f2c';
	var installed_version_id = 'fld-c45a76a8b28b4546821f0a76d6076621';
	var source_id = 'fld-6ecd7dbcad784799b651945616fc4e26';
	var enable_updates_id = 'fld-077d7d4c5619419abb25c7e513e61697';
	var configuration_id = 'fld-3e6941a7fb214e2484c4089fb2356be1';

	return {
		/**
		 * Get a script record and configuration object.
		 *
		 * @param  {string}  scriptName - Name of the script to get the configuration object.
		 *
		 * @return {Array<object>}  An array with two objects: the first is a script record and the second is the configuration object.
		 */
		getConfigObject: function(scriptName)
		{
			let scriptRecord = getRecordFromFormWithKey('Script Manager', script_name_id, scriptName);
			
			if (!scriptRecord.getFieldValue(script_name_id))
			{
				scriptRecord.setFieldValue(script_name_id, scriptName);
			}
			
			let currentConfig = scriptRecord.getFieldValue(configuration_id);
			
			if (!currentConfig)
			{
				currentConfig = {};
			}
			else
			{
				currentConfig = JSON.parse(currentConfig);
			}
			
			return [scriptRecord, currentConfig];
		},
		
		/**
		 * Set a default for a given script's parameter.
		 *
		 * There are some quirks:
		 *  - the default value is only set if the parameter doesn't exist already.
		 *  - the type and options will be updated if the parameter already exists.
		 *
		 * @param  {string}  scriptName - The name of the script.
		 * @param  {string}  paramName - The parameter name within the script context.
		 * @param  {string}  paramType - The type of the parameter mapping to Prompter options.
		 * @param  {*}       paramDefault - The default value for the parameter.
		 * @param  {object}  paramOptions - Options for use with the prompter support.
		 *
		 * @return {object}  Reference to the current object to support chaining/fluent API.
		 */
		setDefault: function(scriptName, paramName, paramType, paramDefault = 'text', paramOptions = {})
		{
			let needsUpdate = false;
			let [scriptRecord, currentConfig] = this.getConfigObject(scriptName);
			
			if (currentConfig[paramName] == undefined)
			{
				currentConfig[paramName] = { 'type': paramType, 'value': paramDefault, 'options': paramOptions };
				needsUpdate = true;
			}
			else
			{
				if (currentConfig[paramName]['type'] != paramType)
				{
					currentConfig[paramName]['type'] = paramType;
					needsUpdate = true;
				}
				
				if (currentConfig[paramName]['options'] != paramOptions)
				{
					currentConfig[paramName]['options'] = paramOptions;
					needsUpdate = true;
				}
			}
			
			if (needsUpdate)
			{
				scriptRecord.setFieldValue(configuration_id, JSON.stringify(currentConfig, null, 4));
				document.saveAllChanges();
			}
			return this;
		},

		/**
		 * Get a value for a given script's parameter.
		 *
		 * @param  {string}  scriptName - The name of the script.
		 * @param  {string}  paramName - The parameter name within the script context.
		 *
		 * @return {*}  The value that was previously set for this item or undefined if not set.
		 */
		getValue: function(scriptName, paramName)
		{
			let [scriptRecord, currentConfig] = this.getConfigObject(scriptName);
			if (currentConfig[paramName] != undefined)
			{
				return currentConfig[paramName]['value'];
			}
			return undefined;
		},

		/**
		 * Set a value for a given script's parameter.
		 *
		 * @param  {string}  scriptName - The name of the script.
		 * @param  {string}  paramName - The parameter name within the script context.
		 * @param  {*}       paramValue - The parameter value within the script context.
		 *
		 * @return {object}  Reference to the current object to support chaining/fluent API.
		 */
		setValue: function(scriptName, paramName, paramValue)
		{
			let [scriptRecord, currentConfig] = this.getConfigObject(scriptName);
			
			if (currentConfig[paramName] == undefined)
			{
				currentConfig[paramName] = {};
			}
			
			currentConfig[paramName]['value'] = paramValue;
			
			scriptRecord.setFieldValue(configuration_id, JSON.stringify(currentConfig, null, 4));
			document.saveAllChanges();			
			return this;
		},

		/**
		 * Clear the configuration object for a script.
		 *
		 * This is mostly intended for testing purposes to reset state.
		 *
		 * @param  {string}  scriptName - The name of the script.
		 * @param  {string}  paramName - The parameter name within the script context.
		 *
		 * @return {object}  Reference to the current object to support chaining/fluent API.
		 */		
		clearConfig: function(scriptName)
		{
			let scriptRecord = getRecordFromFormWithKey('Script Manager', script_name_id, scriptName, false);
			if (!scriptRecord)
			{
				return;
			}
			
			scriptRecord.setFieldValue(configuration_id, '{}');
			document.saveAllChanges();
			return this;
		}
	}
})();

// Testing section. Fake guard for testing.
if (typeof PARENT_SCRIPT === 'undefined')
{
	config.clearConfig('Configuration');
	config.setDefault('Configuration', 'Sample Configuration', 'text', 'Default Value');
	console.log(config.getValue('Configuration', 'Sample Configuration'));
	config.setValue('Configuration', 'Sample Configuration', 'Updated Value');
	console.log(config.getValue('Configuration', 'Sample Configuration'));
}
// ========== Configuration End ========== //
