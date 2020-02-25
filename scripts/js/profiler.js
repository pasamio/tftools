// ========== Profiler Start ========== //
// NAME: Profiler
// VERSION: 1.0.0
/**
 * Profiler module stores timing data.
 */
if (profiler == undefined)

var profiler = (function() {
	let stack = [];
	let entries = [];
	let index = 0;
	let indent = 0;
	let current = undefined;
	return {
		custom: function(start, end, message)
		{
			entries[index] = {'start': start, 'end': end, 'message': message, 'index': index, 'indent': indent};
			index++;
		},
		/**
		 * Start a timer.
		 *
		 * Takes a `message` and adds it to the internal `logdata` variable
		 *   and also logs it to the console with a timestamp.
		 */
		start: function(message)
			{
				let now = new Date();
				stack.push({'start': now.getTime(), 'message': message, 'index': index, 'indent': indent});
				index++;
				indent++;
			},

		/**
		 * Log an error
		 *
		 * Takes a `message` and `error` object and then formats into an error
		 *   via `logMessage`.
		 */
		end: function(endCount = 1)
			{
				for (let i = 0; i < endCount; i++)
				{
					let now = new Date();
					let entry = stack.pop();
					if (entry)
					{
						entry['end'] = now.getTime();
						entries[entry.index]= entry;
						indent--;
					}
					else
					{
						console.log('Uneven profiler.end called (are you missing a start?)');
					}
				}
			},

		/**
		 * Get the internal log buffer
		 *
		 * Returns the raw log buffer to output elsewhere.
		 */
		dump: function(autoClose = true)
			{
				let returnValue = [];
				returnValue.push(`Dump called with index ${index} and indent ${indent}`);
				let dumpIndent = indent;
				
				if (indent > 0)
				{
					if (!autoClose)
					{
						throw Error("Profiler imbalance: started called " + indent + " more times than end.");
					}
					else
					{
						// Close out any mismatched items.
						this.end(indent);
					}
				}
				
				let entry = null;
				for(entry of entries)
				{
					let message = (entry.end - entry.start) + 'ms  \t' + entry.message;
					returnValue.push(message.padStart(message.length + (entry.indent * 4)));
				}
				return returnValue.join('\n');
			},

		/**
		 * Clear the internal state.
		 */
		reset: function()
			{
				stack = [];
				entries = [];
				index = 0;
				indent = 1;
			}
	}
})();

// Testing section. Fake guard for testing.
if (typeof PARENT_SCRIPT === 'undefined')
{
	profiler.start('Test 1');
		profiler.start('Test 2');
		profiler.end();
		profiler.start('Test 3');
			profiler.start('Test 4');
			profiler.end();
		profiler.end();
	profiler.end();
	profiler.start('Function start');
	profiler.start('Complex logic');
	profiler.end(2);
	profiler.start('Mismatch');
	try 
	{
		profiler.dump(false);
	}
	catch (e)
	{
		console.log('Caught expected error from dump: ' + e);
	}
	// Call end one too many times.
	profiler.end(2);
	
	console.log(profiler.dump());
	profiler.reset();
}
// ========== Profiler End ========== //

