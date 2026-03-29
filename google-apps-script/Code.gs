/**
 * Google Apps Script — Daily Journal Backend
 * 
 * Deploy this as a Web App:
 * 1. Open script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Deploy > New deployment > Web app
 * 5. Set "Execute as" to "Me" and "Who has access" to "Anyone"
 * 6. Copy the URL and paste it into the app's Settings
 */

const SHEET_NAME = 'Journal Entries';

/**
 * Handle GET requests — health check & sheet initialization.
 */
function doGet(e) {
  initSheet();
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Daily Journal backend is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests — receive encrypted blobs.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { timestamp, encryptedBlob } = data;

    if (!timestamp || !encryptedBlob) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Missing timestamp or encryptedBlob' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = initSheet();
    sheet.appendRow([timestamp, encryptedBlob, new Date().toISOString()]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Entry saved.' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Initialize the sheet if it doesn't exist.
 */
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Encrypted Blob', 'Received At']);
    sheet.getRange('1:1').setFontWeight('bold');
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 600);
    sheet.setColumnWidth(3, 200);
  }

  return sheet;
}
