

# PicklistID

PicklistID returns the offset index of a value from a pick list.
This is useful for creating a surrogate field for sorting a field
that uses a single value pick list by the ordering of the pick list.

This was originally proposed in the Tap Forms forum as a solution of [sorting by a pick list's ordering](https://www.tapforms.com/forums/topic/pick-list-sort-order-2nd/#post-46660).



## Signature

```javascript
PicklistID(keyfield_id, picklist_name)
```

## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| keyfield_id | string | The internals Tap Forms field ID for the source field.
| picklist_name | string | The name of the pick list to use for ordering.


## Return
*Type: number or null*

The numeric offset if a match is found or null for no match.


## Examples

This would be a sample script field that uses PicklistID to map the value of the field (`fld-fa37906add2942c88bce3b500561c42d` in this case, change for your own field ID) to the offset in the picklist (named `Marketplace` in this case):

```javascript
document.getFormNamed('Script Manager').runScriptNamed('PicklistID');

PicklistID('fld-fa37906add2942c88bce3b500561c42d', 'Marketplace');
```
