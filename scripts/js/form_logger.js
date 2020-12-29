// ========== Form Logger Start ========== //
// NAME: Form Logger
// VERSION: 1.0.5
// CHANGELOG:
//   1.0.5: Add new "CouchDB" layout.
//   1.0.4: Added support for table fields.
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
            getJsName: function(inputString) {
                return inputString.replace(invalidChars, '').replace(/ +/g, '_').toLowerCase();
            },
            dump: function({
                type = [],
                layout = 'default',
                formName = ''
            } = {}) {
                let targetForm = form;
                if (formName) {
                    targetForm = document.getFormNamed(formName);
                }

                let jsFormName = this.getJsName(targetForm.name);
                let shell = {
                    "_id": "rec-generatedidhere",
                    "formName": targetForm.name,
                    "deviceName": "Tampermonkey",
                    "dateModified": "new Date()",
                    "dateCreated": "new Date()",
                    "_attachments": {
                        "photoattachment.jpg": {
                            "data": "base64imagedatahere",
                            "content_type": "image/jpeg",
                        },
                    },
                    "dbID": document.getId(),
                    "type": targetForm.getId(),
                    "form": targetForm.getId(),
                    "values": {}
                };

                switch (layout) {
                    case 'couchdb':
                        // :D
                        break;
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
                for (field in fields) {
                    if (type.length == 0 || type.includes(fields[field].fieldType)) {
                        switch (layout) {
                            case 'couchdb':
                                // :D
                                switch (fields[field].fieldType) {
                                    case 'date':
                                        shell.values[fields[field].getId()] = {
                                            "repeat": 0,
                                            "alert": false,
                                            "title": fields[field].name,
                                            "note": "",
                                            "date": "2020-01-02"
                                        };
                                        break;
                                    case 'photo':
                                        shell.values[fields[field].getId()] = [{
                                            "recordid": "rec-generatedidhere",
                                            "filename": fields[field].name + ".jpg",
                                            "mimetype": "image/jpeg",
                                        }];
                                        break;
                                    case 'table':
                                    case 'date_created':
                                    case 'date_modified':
                                    case 'from_form':
                                    case 'form':
                                    case 'calc':
                                    case 'script':
                                    case 'section':
                                        // no-op fields that shouldn't be set.
                                        break;
                                    default:
                                        shell.values[fields[field].getId()] = fields[field].name + ":" + fields[field].fieldType;
                                        break;
                                }
                                break;
                            case 'variable':
                                if (fields[field].fieldDescription && false) {
                                    console.log('/*');
                                    console.log(fields[field].fieldDescription);
                                    console.log('*/');
                                }

                                let jsFieldName = this.getJsName(fields[field].name);
                                console.log(`var ${jsFormName}__${jsFieldName}_fldID = "${fields[field].getId()}"; // ${fields[field].fieldType}`);

                                if (fields[field].fieldType == 'table') {
                                    baseFieldName = `${jsFormName}__${jsFieldName}`;
                                    for (tableField of fields[field].tableFields) {
                                        let jsTableFieldName = this.getJsName(tableField.name);
                                        console.log(`var ${baseFieldName}__${jsTableFieldName}_fldID = "${tableField.getId()}"; // ${tableField.fieldType}`);
                                    }
                                }
                                break;
                            case 'default':
                            case 'friendly':
                            default:
                                console.log(fields[field].getId() + ": " + fields[field].fieldType + "\t" + fields[field].name);
                                if (fields[field].fieldType == 'table') {
                                    for (tableField of fields[field].tableFields) {
                                        console.log("\t" + tableField.getId() + ": " + tableField.fieldType + "\t" + tableField.name);
                                    }
                                }
                                break;
                        }
                    }
                }

                if (layout == 'couchdb') {
                    console.log("// " + targetForm.name);
                    console.log(JSON.stringify(shell, null, 4));
                }
            },

            dumpAll: function({
                type = [],
                layout = 'default'
            } = {}) {
                let currentForm = null;
                for (currentForm of document.getForms()) {
                    layout == 'default' ? console.log(`==== ${currentForm.name} (${currentForm.getId()}) ===`) : null;
                    formLogger.dump({
                        "formName": currentForm.name,
                        "type": type,
                        "layout": layout
                    });
                    console.log("\n");
                }
            },
        }
    })();

// TEST
if (typeof PARENT_SCRIPT === 'undefined') {
    formLogger.dumpAll({
        "layout": 'couchdb'
    });
}
// ========== Form Logger End ========== //
