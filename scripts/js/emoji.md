# getFlagEmoji

getFlagEmoji converts a country code to a flag.

Source: [https://dev.to/jorik/country-code-to-flag-emoji-a21](https://dev.to/jorik/country-code-to-flag-emoji-a21)
# Signature

```
getFlagEmoji(countryCode)
```

## Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| countryCode         | string  | Country code(required).


# Return

String emoji representing the flag.

# Examples

```
console.log(getFlagEmoji('US'));
console.log(getFlagEmoji('AU'));
console.log(getFlagEmoji('CH'));
console.log(getFlagEmoji('GB')); // UK is Great Britain
console.log(getFlagEmoji('CN'));
```