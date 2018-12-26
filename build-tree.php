#!/usr/bin/php -n -d error_reporting=-1 -d display_errors=1
<?php

foreach(glob(realpath(dirname(__FILE__)) . '/configs/*.ini') as $configFile)
{
	buildTree(parse_ini_file($configFile), basename($configFile));
}


die("All done\n");

function printJoin($forms, $field)
{
	if(isset($field->joinFromField))
	{
		printf("\n\t\t\t ON %s.%s == %s.%s", 
			$forms[$field->form]->name, 
			$forms[$field->form]->fields[$field->joinFromField]->name, 
			$forms[$field->linkToForm]->name,
			$forms[$field->linkToForm]->fields[$field->joinToField]->name);
	}
}


function buildTree($config, $name)
{
	extract($config);

	$forms = array();
	$tableFields = array();

	$limit = 1000;
	$page = 0;
	$total = 0;

	echo "Processing $name\n";
	echo "================\n";

	//echo "\n\n\n";
	//var_dump($config);
	//echo "\n\n\n";
	
	while ($total == 0 || $total > $limit * $page)
	{
		$data = file_get_contents(sprintf('%s/%s/_all_docs?include_docs=true&limit=%s&skip=%s', $dbHost, $dbName, $limit, $page * $limit)) or die("Unable to connect to CouchDB\n");
		$response = json_decode($data);
		$total = $response->total_rows;
		$rows = $response->rows;

		foreach ($rows as $row)
		{
			if ($row->id[0] == '-' || $row->id[0] == '_')
			{
				//printf("This is a special internal record, skipping %s...\n", $row->id);
				continue;
			}

			$prefix = substr($row->id, 0, 3);
			switch($prefix)
			{
				case 'frm':
					// Create the form for the field if the form doesn't already exist.
					if(!isset($forms[$row->id]))
					{
						$forms[$row->id] = new TFForm($row->id);
					}
					
					// If this form doesn't have a name, let's default it.
					if (!isset($row->doc->name))
					{
						$row->doc->name = "[Untitled Form]";
					}

					$forms[$row->id]->name = $row->doc->name;
					break;					
				case 'fld':
					// Table fields don't have forms but they have a tableField
					if(isset($row->doc->tableField))
					{
						if(!isset($tableFields[$row->doc->tableField]))
						{
							$tableFields[$row->doc->tableField] = array();
						}

						$tableFields[$row->doc->tableField][$row->id] = $row->doc;
						break;
					}

					// A field should always have a form!
					if(!isset($row->doc->form))
					{
						printf("Ignoring record %s because it doesn't have a form set.\n", $row->id);
						break;
					}

					// Create the form if it doesn't exist.
					if(!isset($forms[$row->doc->form]))
					{
						$forms[$row->doc->form] = new TFForm($row->doc->form);
					}
				
					// Add the field to the form.	
					$row->doc->id = $row->id;
					$forms[$row->doc->form]->fields[$row->id] = $row->doc;	
					break;

/*
				case 'scr':
					// Create the form if it doesn't exist.
					if(!isset($forms[$row->doc->form]))
					{
						$forms[$row->doc->form] = new TFForm($row->doc->form);
					}
					$row->doc->fieldType = 'form_script';
					$row->doc->id = $row->id;
					$forms[$row->doc->form]->fields[$row->id] = $row->doc;
					break;
*/

				case 'scr': // Form Script
				case 'sea': // Saved Search
				case 'pik': // Pick List
				case 'cat': // Category
				case 'itm': // Layout Item
				case 'lay': // Layout
				case 'rec': // Record
				case 'lnk': // Link
					// silently ignore these fields
					break;	
				default:
					printf("Unknown prefix '%s' for record '%s'\n", $prefix, $row->id);
					break;
			}
		}

		$page++;

	}

	//printf("\n\nPage: %d\nTotal: %d\nLimit: %d\n", $page, $total, $limit);

	foreach($forms as $formId => $form)
	{
		printf("\n%s: (%s)\n", $form->name, $form->id);

		// Sort the fields by the TF sortOrder
		uasort($form->fields, function($a, $b) { return $a->sortOrder > $b->sortOrder; });
		foreach($form->fields as $fieldId => $field)
		{
			// Ugly hack to print out the section header (incl new line) or just a tab intent
			($field->fieldType == 'section') ? printf("\n\t=== ") : printf("\t");
			printf("'%s' %s (%s)", $field->name, $field->fieldType, $fieldId);
			switch($field->fieldType)
			{
				case 'calc':
					if (!isset($field->formula))
					{
						printf(" - calculation field missing formula!\n");
						continue;
					}
					$matches = preg_match_all('/\[([^\]]*)\]/', $field->formula, $calcFields);
					if ($matches)
					{
						printf("\n\t\tReferenced Fields: ");
						foreach(array_unique($calcFields[1]) as $calcField)
						{
							if (strpos($calcField, ':'))
							{
								$pieces = explode(':', $calcField);
								$linkFieldId = $pieces[2];
								$targetFieldId = $pieces[4];
								$linkField = $form->fields[$linkFieldId];
								if ($linkField->fieldType == 'table')
								{
									printf("\n\t\t - %s::%s (%s::%s via %s)", 
										$linkField->name, $tableFields[$linkFieldId][$targetFieldId]->name, 
										$form->id, $targetFieldId, $linkFieldId);
								}
								else
								{
									$targetForm = $linkField->linkToForm;
									$refForm = $forms[$targetForm];
									printf("\n\t\t - %s::%s (%s::%s via %s)", $refForm->name, $refForm->fields[$targetFieldId]->name, $targetForm, $targetFieldId, $linkFieldId);
								}
							}
							else
							{
								printf("\n\t\t - %s (%s)", $form->fields[$calcField]->name, $calcField);
							}
						}
					}
					printf("\n");
					break;
				case 'table':
					printf("\n");
					foreach($tableFields[$fieldId] as $subFieldId=>$subField)
					{
						printf("\t\t- '%s' %s (%s)\n", $subField->name, $subField->fieldType, $subFieldId);
					}
					break;
				case 'form':
				case 'from_form':
					printf(" %s '%s' (%s)", $field->linkToFormType, $forms[$field->linkToForm]->name, $field->linkToForm);				
					printJoin($forms, $field);
					echo "\n";
					break;
				case 'section':
					echo " ===";
				default:
					echo "\n";
					break;
			}
		}
	}
	echo "\n\n";
}


class TFForm 
{
	public $fields;
	public $id;

	public function __construct($id, $fields = array())
	{
		$this->id = $id;
		$this->fields = $fields;
	}
}
