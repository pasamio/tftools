// ========== Form Logger Start ========== //
// NAME: Form Logger
// VERSION: 1.0.3
// CHANGELOG:
//   1.0.3: Replaced `var` with `let` and add PARENT_SCRIPT guard for test.
//   1.0.2: Added support for "variable" layout that outputs field ID's as variables.
//   1.0.1: Added support for custom form name and fix for "getId" rename.

/**
 * Method to dump out the field ID's, type and names with the ability to filter by type.
 */
if (formLogger == undefined)
var formLogger = (function() {
	let invalidChars = new RegExp('[^A-Za-z0-9_ ]', 'g');
	return {
		getJsName: function(inputString)
		{
			return inputString.replace(invalidChars, '').replace(/ +/g, '_').toLowerCase();
		},
		dump: function({type = [], layout = 'default', formName = ''} = {})
		{
			let targetForm = form;
			if (formName)
			{
				targetForm = document.getFormNamed(formName);
			}

			let jsFormName = this.getJsName(targetForm.name);

			switch(layout)
			{
				case 'variable':
					console.log(`// ${targetForm.name}`);
					console.log(`var ${jsFormName}_formID = "${targetForm.getId()}";`);
					break;
				case 'default':
				default:
					console.log('Form Logger: ' + targetForm.name);
					console.log('Type Filter: ' + JSON.stringify(type));
					console.log('Layout: ' + layout);
					break;
			}

	 		let fields = targetForm.getFields();
	 		let field = null;
			for (field in fields)
			{
				if (type.length == 0 || type.includes(fields[field].fieldType)) 
				{
					switch(layout)
					{
						case 'variable':
							if (fields[field].fieldDescription && false) {
								console.log('/*'); 
								console.log(fields[field].fieldDescription); 
								console.log('*/');
							}

							let jsFieldName = this.getJsName(fields[field].name);
							console.log(`var ${jsFormName}__${jsFieldName}_fldID = "${fields[field].getId()}"; // ${fields[field].fieldType}`);
							break;
						case 'default':
						case 'friendly':
						default:
							console.log(fields[field].getId() + ": " + fields[field].fieldType + "\t" + fields[field].name);
							break;
					}
				}
			}
		},
		
		dumpAll: function({type = [], layout = 'default'} = {})
		{
			let currentForm = null;
			for(currentForm of document.getForms())
			{
				layout == 'default' ? console.log(`==== ${currentForm.name} (${currentForm.getId()}) ===`) : null;
				formLogger.dump({"formName": currentForm.name, "type": type, "layout": layout});
				console.log("\n");
			}
		},
	}
})();

// TEST
if (typeof PARENT_SCRIPT === 'undefined')
{
	formLogger.dumpAll({"layout": 'variable'});
}
// ========== Form Logger End ========== //
