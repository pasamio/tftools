

# addToTableIfMissing

Add's a key/value pair to a table if and only if it's missing.

If you have a key that exists already but with a different value, then this will add another table row for it.

# Signature

```
addToTableIfMissing(fieldId, keyField, key, valueField, value)
```

## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fieldId | string | The field ID of the table field.
| keyField | string | The field ID of the key field in the table field.
| key | string | The value of the key field to check against.
| valueField | string | The field ID of the value field in the table field.
| value | string | The value of the value field to check against.

# Return

Empty return value in all cases.



# Examples

