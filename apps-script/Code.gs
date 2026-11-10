// ============================================================
//  Milhouse — The Lock In (Shooting Range) — Apps Script Backend
//  Read-only leaderboard aggregated from the station tabs.
//  Paste this entire file into the Script Editor of the NEW
//  Lock In spreadsheet, then deploy as a Web App
//  (see README.md).
//
//  Each station tab: Name (col A) | Score (col B) | Accuracy (col C),
//  starting at row 2. Highest score wins; accuracy breaks ties.
// ============================================================

// Tab names to read. Leave EMPTY ([]) to read every tab in the spreadsheet
// except the ones listed in IGNORE_SHEETS.
var STATION_SHEETS = [];
var IGNORE_SHEETS  = ['Leaderboard', 'MH Leaderboard'];

// ── Helpers ───────────────────────────────────────────────

function parseNumber(value) {
  if (typeof value === 'number') return value;
  var s = value.toString().replace(/[%,\s]/g, '');
  return s === '' ? NaN : parseFloat(s);
}

// Returns accuracy as 0–100. Accepts 92, "92%", or 0.92 (a %-formatted cell).
function parseAccuracy(value) {
  if (value === '' || value === null) return null;
  var hasPercentSign = typeof value === 'string' && value.indexOf('%') !== -1;
  var n = parseNumber(value);
  if (isNaN(n)) return null;
  if (!hasPercentSign && n <= 1) n = n * 100;
  return Math.round(n * 10) / 10;
}

function getStationSheetNames(ss) {
  if (STATION_SHEETS.length > 0) return STATION_SHEETS;
  var ignore = IGNORE_SHEETS.map(function (n) { return n.toLowerCase(); });
  return ss.getSheets()
    .map(function (sh) { return sh.getName(); })
    .filter(function (n) { return ignore.indexOf(n.toLowerCase()) === -1; });
}

function getStationEntries(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var entries = [];
  for (var i = 0; i < data.length; i++) {
    var name = data[i][0] ? data[i][0].toString().trim() : '';
    if (!name || data[i][1] === '') continue;

    var score = parseNumber(data[i][1]);
    if (isNaN(score)) continue;

    entries.push({ name: name, score: score, accuracy: parseAccuracy(data[i][2]) });
  }
  return entries;
}

function isBetter(a, b) {
  if (a.score !== b.score) return a.score > b.score;
  return (a.accuracy || 0) > (b.accuracy || 0);
}

function buildLeaderboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var names = getStationSheetNames(ss);
  var all = [];
  for (var s = 0; s < names.length; s++) {
    all = all.concat(getStationEntries(ss, names[s]));
  }

  // Group by normalised name, keep best run per player
  var best = {};
  for (var i = 0; i < all.length; i++) {
    var e   = all[i];
    var key = e.name.toLowerCase();
    if (!best[key] || isBetter(e, best[key])) {
      best[key] = e;
    }
  }

  // Sort: score desc, then accuracy desc
  var sorted = Object.values(best).sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return (b.accuracy || 0) - (a.accuracy || 0);
  });

  for (var j = 0; j < sorted.length; j++) {
    sorted[j].position = j + 1;
  }
  return sorted;
}

function makeResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ── GET handler ───────────────────────────────────────────

function doGet(e) {
  try {
    return makeResponse({ status: 'ok', leaderboard: buildLeaderboard() });
  } catch (err) {
    return makeResponse({ status: 'error', message: err.toString() });
  }
}
