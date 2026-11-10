# The Lock In — Shooting Range Leaderboard

A copy of the Fastest Lap board (separate repo: milhouse-fastest-lap) with its own design
and its own Google Sheet.

Live URL (after pushing): `https://wgraczewski.github.io/lock-in/`
Preview with sample data: add `?demo` to the URL.

## Sheet format

Each station tab, starting at row 2:

| A: Name | B: Score | C: Accuracy |
|---|---|---|
| Camden A | 4634 | 100% |

- Accuracy can be typed as `92`, `92%`, or a %-formatted cell.
- Highest score wins; accuracy breaks ties. Each player's best run across all tabs is kept (names match case-insensitively).
- By default **every tab** is read except `Leaderboard` / `MH Leaderboard`. To read only specific tabs, list them in `STATION_SHEETS` at the top of `apps-script/Code.gs`.

## Setup (one time)

1. Open the **new** Lock In Google Sheet → **Extensions → Apps Script**.
2. Delete the starter code, paste in all of `apps-script/Code.gs`, save.
3. **Deploy → New deployment** → type **Web app** → Execute as **Me**, Who has access **Anyone** → **Deploy** (approve the Google auth prompt: Advanced → proceed).
4. Copy the Web App URL and paste it into `APPS_SCRIPT_URL` in `config.js`.
5. Commit and push.

To update the script later, use **Deploy → Manage deployments → ✎ → New version** so the URL stays the same.
