// ========== convertCurrency Start ========== //
// NAME: Convert Currency
// VERSION: 1.2
// CHANGES:
//  1.2: Add support for configuration via Script Manager form.
//  1.1: Add options for different API, update to v7.

document.getFormNamed('Script Manager').runScriptNamed('Logger');
document.getFormNamed('Script Manager').runScriptNamed('Configuration');

/**
 * Convert from one currency to another using a free web serive.
 *
 * source_currency: 		The source currency to convert from (e.g. CAD).
 * destination_currency:	The destination currency to convert into (e.g. USD).
 * amount:					The amount in the source currency to convert into destination currency.
 *
 * return: float value of converted currecny or false on error.
 */
function convertCurrency(source_currency, destination_currency, amount)
{
	var services = { "free" : "https://free.currconv.com", 
						"prepaid": "https://prepaid.currconv.com",
						"premium": "https://api.currconv.com"
					};
					
	var apiKey = config.getValue('Currency', 'API Key');
	var currency_key = source_currency + "_" + destination_currency;
	var url = `${services['prepaid']}/api/v7/convert?compact=ultra&apiKey=${apiKey}&q=${currency_key}`;
	
	logger.logMessage(`Requesting from URL: ${url}`);

	// Make the request.
	var forex = Utils.getJsonFromUrl(url);
			
	// Check the response matches.
	if (forex && forex[currency_key])
	{
		logger.logMessage(`Conversion for ${source_currency} to ${destination_currency} is ${forex[currency_key]}`);
		return forex[currency_key] * amount;
	}
	else
	{
		logger.logMessage("Unknown response received from URL: " + JSON.stringify(forex));
		return false;
	}
}

config.setDefault('Currency', 'API Key', 'text', '');
// ========== convertCurrency End ========== //
