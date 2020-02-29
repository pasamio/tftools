// ========== vlookup Start ========== //
// NAME: vlookup
// VERSION: 1.0

/**
 * VLOOKUP function similar to Excel's version operating on Link to Form fields.
 *
 * This lookup uses a "Link to Form" field inside this form as the source for the vlookup data.
 *
 * @param  {string}  lookup       - The value to match in the target record.
 * @param  {string}  join_field   - The field ID of the "Link to Form" field.
 * @param  {string}  search_field - The field ID of the field containing the value in the child form.
 * @param  {string}  return_field - The field ID of the field containing the return value in the child form.
 *
 * @return {*}  The value of the return field if matched or an empty string.
 */
function vlookup(lookup, join_field, search_field, return_field) {
	var entries = record.getFieldValue(join_field);

	for (var index = 0, count = entries.length; index < count; index++){
     	var target = entries[index].getFieldValue(search_field);
		if (target && target == lookup) {
			return entries[index].getFieldValue(return_field);
		}
	}
	return "";
}

/**
 * VLOOKUP function similar to Excel's version operating on forms.
 *
 * This lookup uses a form in the document as the source for the vlookup data.
 *
 * @param  {string}  lookup       - The value to match in the target record.
 * @param  {string}  form_name    - The field ID of the "Link to Form" field.
 * @param  {string}  search_field - The field ID of the field containing the value in the child form.
 * @param  {string}  return_field - The field ID of the field containing the return value in the child form.
 *
 * @return {*}  The value of the return field if matched or an empty string.
 */
function vlookup_form(lookup, form_name, search_field, return_field) {
	var entries = document.getFormNamed(form_name).getRecords();

	for (var index = 0, count = entries.length; index < count; index++) {
		var target = entries[index].getFieldValue(search_field);
		if (target && target == lookup) {
			return entries[index].getFieldValue(return_field);
		}
	}
	return "";
}
// ========== vlookup End ========== //
