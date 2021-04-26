// Source: https://www.base64encoder.io/javascript/
function utf8Bytes(input) {
	return encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
    });
}
