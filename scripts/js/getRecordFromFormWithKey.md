# getRecordFromFormWithKey

Get a record from a form with a key field, optionally creating it if missing.
 
Note: assumes your key field is unique.

# Signature

```
getRecordFromFormWithKey(formName, keyFieldId, keyValue, createIfMissing = true, earlyTermination = true, alwaysScanOnMiss = false)
```

## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| formName         | string  | The name of the source form for the records (required).
| keyFieldId       | string  | The field ID of the key field in the record (required).
| keyValue         | string  | The value to match as the key (required).
| createIfMissing  | boolean | Control if a record is created if none is found (default: true).
| earlyTermination | boolean | Control if function terminates as soon as a match is found (default: true).
| alwaysScanOnMiss | boolean | Control if we should assume concurrent access (default: false)


# Return

TFRecord if matching record is found or `createIfMissing` is set to true otherwise undefined.


# Examples