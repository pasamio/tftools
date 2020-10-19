// ========== Update Scripts Start ========== //
// NAME: Update Scripts
// VERSION: 1.0.0

var repository_name_id = 'fld-2613fda2880a4ce69ea778c1cd3c98af';
var url_id = 'fld-27a614da6c474daaaf40d0267d29d214';
var scripts_id = 'fld-bdaf4e38c8254f99b2370859636f154b';

var name_id = 'fld-8b943a7b09b845b58867d5ddaf3c4f2c';
var installed_version_id = 'fld-c45a76a8b28b4546821f0a76d6076621';
var enable_updates_id = 'fld-077d7d4c5619419abb25c7e513e61697';

function parseScriptName (scriptName)
{
	let retval = {
		"name": "Unknown Script",
		"protected": false,
		"version": "0"
	};

	const protected = [ 'Update Scripts', 'Bootstrap' ];
	if (protected.includes(scriptName))
	{
		retval.protected = true;
	}
	
	let pieces = scriptName.match(/([^@]*)(@(.*))?/);
	//console.log(JSON.stringify(pieces));
	
	retval.name = pieces[1];
	
	if (pieces[3])
	{
		retval.version = pieces[3];
	}
	
	return retval;
}

function versionCompare(left, right) {
	let leftPieces = left.split('.');
	let rightPieces = right.split('.');

	for (i = 0; i < Math.max(leftPieces.length, rightPieces.length); i++) {
		leftVal = parseInt(leftPieces[i]);
		rightVal = parseInt(rightPieces[i]);
		if (leftVal > rightVal)
		{
			return 1;
		}
		
		if (leftVal < rightVal)
		{
			return -1;
		}
	}
	
	return 0;
}

function buildScriptIndex()
{
	let scriptIndex = {};
	for (script of document.getFormNamed('Script Manager').getScripts())
	{
		console.log(`Indexing Script Name: ${script.name}`);
		
		if (script.name === undefined)
		{
			console.log(`Skipping undefined script: http://10.0.1.26:5984/${document.getId()}/${script.getId()}`);
			continue;
		}
		let scriptName = parseScriptName(script.name);
		//console.log(JSON.stringify(scriptName));
		if (!scriptIndex[scriptName.name])
		{
			scriptIndex[scriptName.name] = {
				"name": scriptName.name,
				"description": script.description,
				"versions": {}
			}
		}
		
		scriptIndex[scriptName.name].versions[scriptName.version] = script;
	}
	return scriptIndex;
}

function buildRecordIndex()
{
	let recordIndex = {};
	let records = document.getFormNamed('Script Manager').getRecords();
	for (currentRecord of records)
	{
		recordIndex[currentRecord.getFieldValue(name_id)] = currentRecord;	}
	return recordIndex;
}

function Update_Scripts(record) {
	let scriptIndex = buildScriptIndex();
	let recordIndex = buildRecordIndex();

	console.log(record.getFieldValue(repository_name_id));

	urlSource = record.getFieldValue(url_id);
	
//	console.log(JSON.stringify(scriptIndex, null, 4));
	
	let data = Utils.getJsonFromUrl(urlSource);
//	console.log(JSON.stringify(data, null, 4));

	for (datum of data)
	{
		if (scriptIndex[datum.name])
		{
			console.log(`Found script ${datum.name}`);
		}
		else
		{
			console.log(`Adding script ${datum.name}`);
			scriptIndex[datum.name] = {
				"name": datum.name,
				"description": datum.description,
				"versions": {}
			};
		}
		
		if (recordIndex[datum.name])
		{
			console.log(`Found record ${datum.name}`);
		}
		else
		{
			console.log(`Adding record for ${datum.name}`);
			recordIndex[datum.name] = record.addNewRecordToField(scripts_id);
			recordIndex[datum.name].setFieldValue(name_id, datum.name);
		}
		
		let scriptInstance = scriptIndex[datum.name];
		for (version of datum.versions)
		{
			console.log(version.version);
			if (!scriptInstance.versions[version.version])
			{
				console.log('Adding script version: ' + version.version);
				let newScript = document.getFormNamed('Script Manager').addNewScriptNamed(`${datum.name}@${version.version}`);
				newScript.description = datum.description;
				newScript.code = Utils.getTextFromUrl(version.url);
				scriptInstance.versions[version.version] = newScript;
			}
			else
			{
				console.log(`Found match for ${version.version}`);
			}
			
			if (recordIndex[datum.name].getFieldValue(enable_updates_id) && 
				(!recordIndex[datum.name].getFieldValue(installed_version_id) ||
					versionCompare(version.version, recordIndex[datum.name].getFieldValue(installed_version_id)) == 1)
				)
			{
				console.log(`Update in use version to ${version.version}`);
				recordIndex[datum.name].setFieldValue(installed_version_id, version.version);
				document.getFormNamed('Script Manager').deleteScriptNamed(datum.name);
				let linkScript = document.getFormNamed('Script Manager').addNewScriptNamed(datum.name);
				linkScript.description = datum.description;
				linkScript.code = `document.getFormNamed('Script Manager').runScriptNamed('${datum.name}@${version.version}');`;
			}
		}
		console.log("===");
	}
	
	//console.log(JSON.stringify(scriptIndex, null, 4));
	document.saveAllChanges();
	console.log("All done!");
}

for (record of form.getSearchNamed("Enabled Repositories").getRecords())
{
	Update_Scripts(record);
}
// ========== Update Scripts End ========== //

