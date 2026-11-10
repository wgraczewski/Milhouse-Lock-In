// ── CONFIGURATION — The Lock In (Shooting Range) ──────────
// After deploying the Lock In Apps Script as a Web App, paste its URL below.
// This is a DIFFERENT deployment from the Fastest Lap one (see README.md).

var APPS_SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';

// How often (in milliseconds) the leaderboard auto-refreshes.
var POLL_INTERVAL_MS = 2000; // 2 seconds

// Event title
var EVENT_TITLE = 'The Lock In — Shooting Range';

// Prizes shown in the sidebar (in display order)
var PRIZES = [
  { place: '1st Place', prize: 'Logitech Playseat Trophy and Logitech Wheel and Pedal Set' },
  { place: '2nd Place', prize: 'Milhouse Marble Headset Stand with Wireless Headset' },
  { place: '3rd Place', prize: 'Professional Gaming Tee and Cap' }
];
