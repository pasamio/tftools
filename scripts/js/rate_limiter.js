// ========== Rate Limiter Start ========== //
// NAME: Rate Limiter
// VERSION: 1.0.0
// CHANGELOG:
//   1.0.0: Initial release.
/**
 * Rate Limiter module provides utilities to limit and delay
 * over time.
 */
if (typeof rateLimiter === 'undefined')
{

	var rateLimiter = {};
	
	/**
	 * Spin lock delay mechanism.
	 *
	 * This will block execution until the time limit.
	 *
	 * @param {integer} duration - The length of the delay in milliseconds.
	 */ 
	function delay(duration)
	{
		let now = new Date();
		let future = now.getTime() + duration;
		while((new Date()).getTime() < future) { }
	}
	
	/**
	 * Blocking rate limited delay mechanism.
	 *
	 * This will block a request until a minimum time has been elapsed.
	 * If based on the last execution of the `key`, `minTime` milliseconds
	 * have not elapsed, this will block until that time has elapsed.
	 *
	 * `key` is shared with rateLimitedCallback.
	 *
	 * @param {string}  key - The key to validate the last execution.
	 * @param {integer} minTime - The minimum amount of time between execution.
	 */
	function rateLimitedDelay(key, minTime = 5000)
	{
		if (typeof rateLimiter[key] === 'undefined')
		{
			rateLimiter[key] = 0;
		}
		let now = new Date().getTime();
		let nextExecution = rateLimiter[key] + minTime;
		if (now < nextExecution)
		{
			delay(nextExecution - now);
		}
		rateLimiter[key] = new Date().getTime();
	}

	/** 
	 * Non-blocking rate limited callback executor.
	 *
	 * This will execute `callback` only if `callback` hasn't been 
	 * executed as `key` for at least `minTime` milliseconds since
	 * the last execution. If it has been executed then it will not
	 * execute this instance.
	 *
	 * `key` is shared with `rateLimitedDelay`.
	 *
	 * @param {string}   key - The key to validate the last execution.
	 * @param {function} callback - Callback to execute.
	 * @param {integer}  minTime - The minimum amount of time between executions.
	 */
	function rateLimitedCallback(key, callback, minTime = 5000)
	{
		if (rateLimitedChecker(key, minTime))
		{
			callback();
		}
	}
	
	function rateLimitedChecker(key, minTime = 5000)
	{
		if (typeof rateLimiter[key] === 'undefined')
		{
			rateLimiter[key] = 0;
		}
		let now = new Date().getTime();
		let nextExecution = rateLimiter[key] + minTime;
		if (now > nextExecution)
		{
			rateLimiter[key] = new Date().getTime();
			return true;
		}
		return false;
	}
}

// Tests
if (typeof PARENT_SCRIPT === 'undefined')
{
	console.log('Message 1 at ' + new Date());
	rateLimitedDelay('test');
	rateLimitedDelay('test');
	rateLimitedCallback('callback', function() { console.log('Callback 1: ' + new Date()) }); 
	console.log('Message 2 at ' + new Date());
	delay(3000);
	rateLimitedCallback('callback', function() { console.log('Callback 2: ' + new Date()) });
	rateLimitedDelay('test');
	console.log('Message 3 at ' + new Date());
	delay(6000);
	rateLimitedCallback('callback', function() { console.log('Callback 3: ' + new Date()) });
	console.log('Message 4 at ' + new Date());
	rateLimitedDelay('test');
	console.log('Message 5 at ' + new Date());
	rateLimitedCallback('callback', function() { console.log('Callback 4: ' + new Date()) });	
}
// ========== Rate Limiter End ========== //

