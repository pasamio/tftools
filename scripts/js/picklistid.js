// NAME: PicklistID
// VERSION: 1.0

/**
 * PicklistID returns the offset index of a value from a pick list.
 *
 * This is useful for creating a surrogate field for sorting a field
 * that uses a single value pick list by the ordering of the pick list.
 *
 * Reference:
 * https://www.tapforms.com/forums/topic/pick-list-sort-order-2nd/#post-46660
 *
 * @param {string} keyfield_id - The internals Tap Forms field ID for the source field.
 * @param {string} picklist_name - The name of the pick list to use for ordering.
 *
 * @return {(number|null)}  The offset matching the value from the field or null if not matched.
 */
function PicklistID(keyfield_id, picklist_name) {
	let key = record.getFieldValue(keyfield_id);
	let picklist = document.getPickListNamed(picklist_name).values;
	for(let offset in picklist) {
		if (picklist[offset].value == key) {
			return offset;
		}
	}
	return null;
}

