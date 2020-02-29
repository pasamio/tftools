// ========== Stack Counter Start ========== //
// NAME: Stack Counter
// VERSION: 1.0.0
// CHANGELOG:
//   1.0.0: Initial release.
/**
 * Debugging tool to count stacks and validate re-entrant behaviour.
 */
if (!stackCounter)
{
	var stackCounter = (function() {
		let stack = [];
		let trace = false;
		
		return {
			setTrace: function(newTrace)
			{
				trace = newTrace;
			},
		
			enter: function(formName, formId, scriptName, scriptId) {
				stack.push({'formName': formName, 'formId': formId, 'scriptName': scriptName, 'scriptId': scriptId});
				if (trace)
				{
					console.log(`Entering method: ${formName}/${scriptName} at depth ${stack.length}`);
				}
			},
			
			leave: function() {
				let self = stack.pop();
				if (trace)
				{
					console.log(`Leaving method: ${self.formName}/${self.scriptName} (${stack.length})`);
				}
			}
		}
	})();
}
// ========== Stack Counter End ========== //
