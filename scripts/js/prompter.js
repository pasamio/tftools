// ========== Prompter Functions Start ========== //
// NAME: Prompter Functions
// VERSION: 1.0
/**
 * Prompter Functions for using the async system to handle some requests.
 */
 
// Temporary variable to store callback details.
var prompterTempVar = undefined;

/**
 * Prompt a confirmation dialog with a simple message.
 *
 * NOTE: This method uses async, please make sure your calling method is declared 'async'.
 *
 * @param {string} text - The text to display in the dialog for the confirmation.
 * @param {string} continueTitle - The text for the continue button.
 * @param {string} cancelTitle - The text for the cancel button.
 *
 * @return {boolean} Boolean result if the user confirmed or declined the dialog.
 */
function promptConfirm(text, continueTitle = 'Continue', cancelTitle = 'Cancel') {
	return new Promise(function(resolve, reject) {
	  	let prompter = Prompter	.new();
  		prompter.cancelButtonTitle = cancelTitle;
		prompter.continueButtonTitle = continueTitle;
		prompter.show(text, ((status) => {
			if (status == true) {
				resolve(true);
			} else {
				resolve(false);
			}		
		}));
	});
}

/**
 * Prompt 
 *
 * NOTE: This method uses async, please make sure your calling method is declared 'async'.
 *
 * @param {string} text - The text to display in the dialog for the confirmation.
 * @param {string} popupName - The prefix to display for the text box of the prompt.
 * @param {string} [continueTitle=Continue] - The text for the continue button.
 * @param {string} [cancelTitle=Cancel] - The text for the cancel button.
 *
 * @return {(string|boolean)} The input text or false if cancelled.
 */
function promptText(text, popupName, continueTitle = 'Continue', cancelTitle = 'Cancel'){
	return new Promise(function(resolve, reject) {
		prompterTempVar = undefined;
	  	let prompter = Prompter	.new();
	  	prompter.addParameter(popupName, 'prompterTempVar')
  		prompter.cancelButtonTitle = cancelTitle;
		prompter.continueButtonTitle = continueTitle;
		prompter.show(text, ((status) => {
			if (status == true && prompterTempVar) {
				resolve(prompterTempVar);
			} else {
				resolve(false);
			}		
		}));
	});
}
// ========== Prompter Functions End ========== //
