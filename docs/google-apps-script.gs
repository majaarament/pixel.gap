function doPost(e) {
  const SHEET_NAME = "responses";
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

  const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  const row = HEADERS.map((header) => payload[header] || "");
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
