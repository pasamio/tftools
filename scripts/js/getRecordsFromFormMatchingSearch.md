# getRecordsFromFormMatchingSearch

Get a list of records matching the provided search criteria. This is useful for specifying multiple fields that must match or for searching for mutliple matching values.

# Signature

```
getRecordsFromFormMatchingSearch(formId, criterion)
```

## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| formId         | string  | The ID of the source form for the records, though will fallback to name search (required).
| criterion       | list  | A list of objects with `key` and `value` entries for the fields to match (required). |


# Return

A list of TFRecord's matching the search criteria.


# Examples

The [Managed Fields](https://github.com/pasamio/tftools/blob/master/scripts/js/managed_fields.js) script leverages `getRecordsFromFormMatchingSearch` to find matching configurations for a field and to detect if more than one configuration has been set:

```	
let searchCriteria = [
		{"key":field_configuration__form_fldID, "value":this.getId()}, 
		{"key":field_configuration__field_fldID, "value":fieldId}
	];

	let configurations = getRecordsFromFormMatchingSearch(fcForm.getId(), searchCriteria);
```