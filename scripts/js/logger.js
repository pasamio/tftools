// ========== Logger Start ========== //
// NAME: Logger
// VERSION: 1.0.1
/**
 * Logger module provides some extra utility functions for logging data.
 * This adds some useful functions for integrating with the console and
 *   for building script fields. 
 */
var logger = (function() {
	var logdata = "";
	return {
		/**
		 * Log a message
		 *
		 * Takes a `message` and adds it to the internal `logdata` variable
		 *   and also logs it to the console with a timestamp.
		 */
		logMessage: function(message)
			{
				logdata += message + "\r\n";
				console.log(new Date() + '\t' + message)
			},

		/**
		 * Get the internal log buffer
		 *
		 * Returns the raw log buffer to output elsewhere.
		 */
		getLog: function()
			{
				return logdata;
			},

		/**
		 * Clear the internal log buffer
		 *
		 * Resets the buffer to an empty string.
		 */
		clearLog: function()
			{
				logdata = "";
			},

		/**
		 * Utility function to print a header when the script starts with optional form name
		 */
		consoleHeader: function(scriptName, formName = "")
			{
				var label = scriptName + (formName ? ` (${formName})` : '');
				console.log('==================================================================');
				console.log('Start "' + label + '" script execution at ' + new Date());
				console.log('==================================================================\n');
			},
			
		/**
		 * Utility function to print a footer when the script ends with optional form name
		 */
		consoleFooter: function(scriptName, formName = "")
			{
				var label = scriptName + (formName ? ` (${formName})` : '');
				console.log('\n==================================================================');
				console.log('End "' + label + '" script execution at ' + new Date());
				console.log('==================================================================\n');
			}
	}
})();
// ========== Logger End ========== //
