
Prompter Functions for using the async system to handle some requests.

# promptConfirm

Prompt a confirmation dialog with a simple message.

> NOTE: This method uses async, please make sure your calling method is declared 'async'.

## Signature

```javascript
promptConfirm(text, continueTitle = 'Continue', cancelTitle = 'Cancel')
```

## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| text | string | The text to display in the dialog for the confirmation.
| continueTitle | string | The text for the continue button. (default: "Continue")
| cancelTitle   | string | The text for the cancel button. (default: "Cancel")


## Return
*Type: boolean*

Boolean result if the user confirmed or declined the dialog.


## Examples

```javascript
document.getFormNamed('Script Manager').runScriptNamed('Prompter Functions');

async function promptConfirmExample() {
	let confirmed = await promptConfirm('Are you sure?');
	console.log(confirmed);
}

promptConfirmExample();
```


# promptText

Prompt for a text input.

> NOTE: This method uses async, please make sure your calling method is declared 'async'.

## Signature

```javascript
promptText(text, popupName, continueTitle = 'Continue', cancelTitle = 'Cancel')
```


## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| text | string | The text to display in the dialog for the confirmation. |
| popupName | string | The prefix to display for the text box of the prompt. |
| continueTitle | string | The text for the continue button. (default: "Continue") |
| cancelTitle | string | The text for the cancel button. (default: "Cancel") |

## Return
*Type: string or boolean*

The input text or false if cancelled.



## Examples

```javascript
document.getFormNamed('Script Manager').runScriptNamed('Prompter Functions');

async function promptTextExample() {
	let details = await promptText('Enter Value', 'Location:');
	console.log(details);
}

promptTextExample();
```
