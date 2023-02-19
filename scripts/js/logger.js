// ========== Logger Start ========== //
// NAME: Logger
// VERSION: 1.0.3
// CHANGELOG:
//   1.0.3: Add log level support with per module controls.
/**
 * Logger module provides some extra utility functions for logging data.
 * This adds some useful functions for integrating with the console and
 *   for building script fields.
 */
if (logger == undefined) {

var LOGLEVELS = {
	'EMERGENCY': 0,
	'ALERT':     1,
	'CRITICAL':  2,
	'ERROR':     3,
	'WARN':      4,
	'NOTICE':    5,
	'INFO':      6,
	'DEBUG':     7,
};

var LOGLEVEL_NAMES = Object.keys(LOGLEVELS);

Object.freeze(LOGLEVELS);
Object.freeze(LOGLEVEL_NAMES);
var LOGLEVEL = LOGLEVELS.WARN;
var LOGGER_DEBUG = false;


var logger = (function() {
	/** logdata stores the log entries to be returned later */
	let logdata = "";

	/** overrides of the logger system for log levels */
	let overrides = {};

	return {
		/** parent of this logger */
		parent: undefined,

		/** moduleName stores the name of the log module */
		moduleName: "",

		/** localeSetting controls date/time formatting. */
		localeSetting: {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
		},

		/** localeCountry controls date/time formatting. */
		localeCountry: "en-au",

		/**
		 * Gather environment is a convenience function.
		 *
		 * Allows the correct behaviour if calling from the log message directly or proxied.
		 *
		 * @return {dictionary} Caller, script and timestamp keys.
		 */
		gatherEnvironment: function() {
			// Today on crimes against Javascript...
			let sCallerName;
			{
				let re = /([^(]+)@|at ([^(]+) \(/g;
				let aRegexResult = re.exec(new Error().stack.split("\n")[2]);
				if (!aRegexResult) {
					this._internalLog("Unknown caller on stack? " + new Error().stack);
					sCallerName = "UnknownCaller";
				} else {
					sCallerName = aRegexResult[1] || aRegexResult[2];
				}
			}
			scriptName = "PARENT_UNSET";
			if (typeof PARENT_SCRIPT !== 'undefined') {
				scriptName = PARENT_SCRIPT;
			}
			return {'caller': sCallerName, 'script': scriptName, 'timestamp': new Date().toISOString()};
		},

		/**
		 * Fork this logger into a child with a new module.
		 *
		 * @param  {string} moduleName - The name of module to use for this logger.
		 *
		 * @return {logger} Properly constructed child.
		 */
		fork: function(moduleName) {
			let child = Object.assign({}, this);
			child.moduleName = moduleName;
			child.parent = this;
			return child;
		},

		/**
		 * Set a log level for a target module.
		 *
		 * @param {integer} logLevel - The log level to set.
		 * @param {string}  target - The module to alter the log level.
		 */
		setLogLevelForTarget: function(logLevel, target) {
			if (this.parent) {
				return this.parent.setLogLevelForTarget(logLevel, target);
			}
			overrides[target] = logLevel;
			this._internalLog(`Setting ${target} to ${logLevel}`);
		},

		/**
		 * Get a log level for a target module.
		 *
		 * @param {string} target - Target module to retrieve configuration.
		 *
		 * @return {integer} Target log level
		 */
		getLogLevelForTarget: function(target) {
			if (this.parent) {
				return this.parent.getLogLevelForTarget(target);
			}
			if (overrides[target] !== undefined) {
				this._internalLog(`Returning ${overrides[target]} for ${target}`);
				return overrides[target];
			}
			// return default log level
			target ? this._internalLog(`Returning default for ${target}`) : undefined;
			return LOGLEVEL;
		},

		/**
		 * Handle log message does the actual logging.
		 *
		 * @param {string}  message - Message to log
		 * @param {integer} level - Level at which to log the message
		 * @param {env}     dict - the environment to use
		 *
		 * @return {bool} If a message was logged or not.
		 */
		_handleLogMessage: function(message, level, env=undefined) {
			if (!env) {
				env = this.gatherEnvironment();
			}
			let moduleLogLevel = this.getLogLevelForTarget(this.moduleName);
			if (level > moduleLogLevel) {
				this._internalLog(`Message log level ${level} is higher than target log level ${moduleLogLevel}`);
				return false;
			}
			this._internalLog("Parent? " + this.parent);
			this._internalLog("Module Name? " + this.moduleName);
			this._internalLog(JSON.stringify(overrides));
			this._internalLog(JSON.stringify(env));
			console.log(`${env.timestamp} ${env.caller} ${env.script} ${LOGLEVEL_NAMES[level]} ${message}`);
			return true;
		},

		/**
		 * Internal log only logs if PARENT_SCRIPT unset or LOGGER_DEBUG is on.
		 *
		 * Who logs the loggers? We do.
		 *
		 * @param {string} message - The message to log.
		 */
		_internalLog: function(message) {
			if (typeof PARENT_SCRIPT === "undefined" || LOGGER_DEBUG) {
				console.log(message);
			}
		},

		debug: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.DEBUG, this.gatherEnvironment());
		},

		info: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.INFO, this.gatherEnvironment());
		},

		notice: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.NOTICE, this.gatherEnvironment());
		},

		warn: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.WARN, this.gatherEnvironment());
		},

		error: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.ERROR, this.gatherEnvironment());
		},

		critical: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.CRITICAL, this.gatherEnvironment());
		},

		alert: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.ALERT, this.gatherEnvironment());
		},

		emergency: function(message) {
			return this._handleLogMessage(message, LOGLEVELS.EMERGENCY, this.gatherEnvironment());
		},

		/**
		 * Log a message
		 *
		 * Takes a `message` and adds it to the internal `logdata` variable
		 *   and also logs it to the console with a timestamp.
		 *
		 * @param {string} message - Message to log.
		 */
		logMessage: function(message)
			{
				logdata += message + "\r\n";
				console.log(new Date() + '\t' + message)
			},

		/**
		 * Log an error
		 *
		 * Takes a `message` and `error` object and then formats into an error
		 *   via `logMessage`.
		 *
		 * @param {error} error - Error object to log.
		 */
		logError: function(error)
			{
				this.logMessage(`Caught error: "${error}" at ${error.line}, ${error.column}`);
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
				this.clearLog();
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

}

function LoggerTest() {
	logger.consoleHeader("Logger", "Script Manager");
	logger.logMessage("Testing legacy logger interface");
	logger.debug("test");
	local = logger.fork("tester");
	local.debug("fork test");
	logger.setLogLevelForTarget(LOGLEVELS.ALERT, "tester");
	let debugTest = local.debug("fork test 2");
	console.log("Debug Test: " + debugTest);
	local.setLogLevelForTarget(LOGLEVELS.DEBUG, "tester");
	local.debug("fork test 3");
	logger.consoleFooter("Logger", "Script Manager");
}

if (typeof PARENT_SCRIPT === "undefined") {
	LoggerTest();
}
// ========== Logger End ========== //
