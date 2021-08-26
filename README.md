# localix

> Generate iOS, Android and JSON Localization Files from Google Sheets

## Installation

* `yarn global add localix`
* `npm -g install localix`

## Configuration

Create `localix.json` with the following contents:

```json
{
  "spreadsheetId": "GOOGLE_SHEET_ID",
  "sheetName": "GOOGLE_SHEET_NAME",
  "clientEmail": "GOOGLE_AUTH_CLIENT_EMAIL",
  "privateKey": "GOOGLE_AUTH_PRIVATE_KEY",
  "variables": {
    "{VariableName}": { "ios": "%@", "android": "%1$s", "json": "%s" }
  },
  "output": {
    "ios": "output/ios",
    "android": "output/android",
    "json": "output/json"
  }
}

```

## Usage

* Run `localix`
