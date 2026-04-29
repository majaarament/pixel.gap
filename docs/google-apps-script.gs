const SPREADSHEET_ID = "1xaDTwzQklHjr9fdTwynUB4_wWTmxx3wE3qRFe7nRsEU";
const SHEET_NAME = "gap_report_answers";
const HEADERS = [
  "receivedAt",
  "timestamp",
  "eventType",
  "userId",
  "sessionId",
  "questStage",
  "turnIndex",
  "conversationRole",
  "npcId",
  "npcName",
  "npcRole",
  "stepId",
  "prompt",
  "choiceKey",
  "choiceLabel",
  "text",
  "roleLevel",
  "branch",
  "country",
  "userAgent",
];

function getSheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "YOUR_SHEET_ID_HERE") {
    throw new Error("Please set SPREADSHEET_ID in your Apps Script before deploying.");
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function doGet(e) {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: "Google Sheets logger endpoint is alive. Send POST requests to store data.",
        sheetId: SPREADSHEET_ID,
        sheetName: SHEET_NAME,
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const sheet = getSheet();
    const row = HEADERS.map((header) => payload[header] || "");
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, rowCount: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
