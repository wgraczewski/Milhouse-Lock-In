(function () {
  'use strict';

  // ── State ───────────────────────────────────────────────
  var pollTimer = null;

  // ── DOM refs (populated after DOMContentLoaded) ─────────
  var $tbody, $prizeList;

  // Add ?demo to the URL to preview the board with sample data
  var DEMO = /[?&]demo\b/.test(location.search);
  var DEMO_DATA = [
    ['Camden A', 4634, 100], ['Bryce P', 4235, 92], ['Kiko', 4212, 91],
    ['JakeNBake', 4098, 90], ['Shemoi', 3975, 88], ['Jonah F', 3860, 86],
    ['Andrew H', 3742, 84], ['Aaron E', 3625, 82], ['Luke L', 3510, 80],
    ['Mike W', 3394, 78]
  ].map(function (r, i) {
    return { name: r[0], score: r[1], accuracy: r[2], position: i + 1 };
  });

  // ── Utilities ────────────────────────────────────────────

  function formatScore(score) {
    var n = Number(score);
    return isNaN(n) ? String(score) : String(Math.round(n));
  }

  function formatAccuracy(acc) {
    if (acc === null || acc === undefined || acc === '') return '';
    var n = Number(acc);
    return isNaN(n) ? String(acc) : Math.round(n) + '%';
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderPrizes() {
    if (!$prizeList || typeof PRIZES === 'undefined') return;
    $prizeList.innerHTML = PRIZES.map(function (p) {
      return '<div class="prize-item">' +
        '<span class="prize-place">' + escHtml(p.place) + '</span>' +
        '<span class="prize-name">'  + escHtml(p.prize) + '</span>' +
        '</div>';
    }).join('');
  }

  // ── Leaderboard rendering ────────────────────────────────

  var MAX_ROWS   = 10;
  var rowsByName = {}; // player name (lowercased) -> row element

  function setText(el, value) {
    value = String(value);
    if (el.textContent !== value) el.textContent = value;
  }

  function makeRow() {
    var el = document.createElement('div');
    el.className = 'leaderboard-row is-entering';
    el.setAttribute('role', 'row');
    el.innerHTML =
      '<span class="cell-pos" role="cell"><span class="pos-number"></span></span>' +
      '<span class="cell-name" role="cell"></span>' +
      '<span class="cell-score" role="cell"></span>' +
      '<span class="cell-acc" role="cell"></span>';
    el.addEventListener('animationend', function () {
      el.classList.remove('is-entering');
    });
    return el;
  }

  function renderLeaderboard(data) {
    var leaderboard = (data || []).slice(0, MAX_ROWS);

    if (leaderboard.length === 0) {
      $tbody.innerHTML =
        '<div class="leaderboard-empty">No scores yet — be the first!</div>';
      rowsByName = {};
      return;
    }

    var stray = $tbody.querySelector('.leaderboard-empty');
    if (stray) stray.remove();

    var seen   = {};
    var prevEl = null;

    leaderboard.forEach(function (entry) {
      var key = entry.name.toLowerCase();
      seen[key] = true;

      var el = rowsByName[key];
      if (!el) {
        el = makeRow();
        rowsByName[key] = el;
      }

      var wantLeaderClass = entry.position === 1;
      if (el.classList.contains('pos-1') !== wantLeaderClass) {
        el.classList.toggle('pos-1', wantLeaderClass);
      }
      setText(el.querySelector('.pos-number'), entry.position);
      setText(el.querySelector('.cell-name'),  entry.name);
      setText(el.querySelector('.cell-score'), formatScore(entry.score));
      setText(el.querySelector('.cell-acc'),   formatAccuracy(entry.accuracy));

      var wantedNext = prevEl ? prevEl.nextSibling : $tbody.firstChild;
      if (wantedNext !== el) {
        $tbody.insertBefore(el, wantedNext);
      }
      prevEl = el;
    });

    // Drop rows for players no longer in the top MAX_ROWS
    Object.keys(rowsByName).forEach(function (key) {
      if (!seen[key]) {
        var el = rowsByName[key];
        if (el.parentNode) el.parentNode.removeChild(el);
        delete rowsByName[key];
      }
    });
  }

  // ── API calls ────────────────────────────────────────────

  function hasUrl() {
    return APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'PASTE_YOUR_WEB_APP_URL_HERE';
  }

  function fetchLeaderboard() {
    if (!hasUrl()) return;
    var url = APPS_SCRIPT_URL + '?_t=' + Date.now();
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status === 'ok') {
          renderLeaderboard(data.leaderboard);
        }
      })
      .catch(function () { /* silent fail — try again next poll */ });
  }

  function startPolling() {
    fetchLeaderboard();
    pollTimer = setInterval(fetchLeaderboard, POLL_INTERVAL_MS);
  }

  // ── Init ─────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    $tbody     = document.getElementById('lb-tbody');
    $prizeList = document.getElementById('prize-list');

    renderPrizes();

    if (DEMO) {
      renderLeaderboard(DEMO_DATA);
      return;
    }

    if (!hasUrl()) {
      renderLeaderboard([]);
      return;
    }

    startPolling();
  });

}());
