/* Mind plan, step 3: the coach's practices (not scored). Library on the left, chosen list and the patient note on the right.
   Plan fields: plan.practices = [{ id, times, habits? }], plan.note. Prefix pr-. */
(function () {
  var MP = window.MP = window.MP || {};
  MP.steps = MP.steps || {};
  var H = MP.helpers, esc = H.esc;

  var TIMES_MIN = 1, TIMES_MAX = 14, WEEKS_MIN = 1, WEEKS_MAX = 12, HABITS_MAX = 8, NOTE_MAX = 500;

  var CSS = [
    ".pr-root{display:flex;flex-direction:column;gap:16px;color:#475467;font:400 14px/20px Onest,system-ui,sans-serif}",
    ".pr-root *{box-sizing:border-box}",
    ".pr-h1{margin:0;font:800 24px/32px Montserrat,sans-serif;color:#1D4D38}",
    ".pr-intro{margin:4px 0 0}",
    ".pr-card{background:#fff;border:1px solid #E4E7EC;border-radius:18px;padding:20px 22px}",
    ".pr-label{display:block;font:700 11px/16px Onest,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#475467;margin:0 0 8px}",
    ".pr-input{width:100%;height:44px;background:#F3FCF8;border:1px solid #E4E7EC;border-radius:11px;padding:0 14px;font:600 14px Onest,sans-serif;color:#101828;outline:none}",
    ".pr-input::placeholder{color:#98A2B3;font-weight:500}",
    ".pr-root :focus-visible{outline:2px solid #299D6B;outline-offset:2px}",
    ".pr-input:focus-visible{outline:none;border-color:#299D6B;box-shadow:0 0 0 3px rgba(41,157,107,.18)}",
    /* top: search and theme pills on one line each */
    ".pr-top{display:flex;flex-direction:column;gap:12px;padding:16px 18px}",
    ".pr-search{position:relative}",
    ".pr-search svg{position:absolute;left:14px;top:13px;color:#667085;pointer-events:none}",
    ".pr-search .pr-input{padding-left:40px}",
    ".pr-pills{display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}",
    ".pr-pills::-webkit-scrollbar{display:none}",
    ".pr-pill{flex:none;height:28px;padding:0 12px;border-radius:999px;border:1px solid #E4E7EC;background:#fff;font:600 12.5px Onest,sans-serif;color:#344054;cursor:pointer;white-space:nowrap}",
    ".pr-pill:hover{border-color:#299D6B}",
    ".pr-pill[aria-pressed=true]{background:#299D6B;border-color:#299D6B;color:#fff}",
    ".pr-pill:disabled{opacity:.45;cursor:default;border-color:#E4E7EC}",
    /* two columns */
    ".pr-cols{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:16px;align-items:start}",
    ".pr-lib{display:flex;flex-direction:column;gap:16px;min-width:0}",
    ".pr-side{position:sticky;top:16px;display:flex;flex-direction:column;gap:16px;max-height:calc(100vh - 112px);overflow:auto;border-radius:18px;scrollbar-width:thin}",
    "@media (max-width:900px){.pr-cols{grid-template-columns:1fr}.pr-side{position:static;max-height:none}}",
    /* library */
    ".pr-theme{padding:18px 0 8px}",
    ".pr-theme .pr-h2{padding:0 22px 6px}",
    ".pr-h2{margin:0;font:800 16px/24px Montserrat,sans-serif;color:#1D4D38}",
    ".pr-row{display:flex;align-items:center;gap:16px;padding:10px 22px}",
    ".pr-row-txt{flex:1;min-width:0}",
    ".pr-name{font:600 14px/20px Onest,sans-serif;color:#101828}",
    ".pr-desc{font:400 13px/18px Onest,sans-serif;color:#98A2B3}",
    ".pr-add{flex:none;width:32px;height:32px;border-radius:50%;border:1px solid #299D6B;background:#fff;color:#299D6B;cursor:pointer;display:grid;place-items:center}",
    ".pr-add:hover{background:#F3FCF8}",
    ".pr-add.is-added{border-color:#299D6B;background:#299D6B;color:#fff}",
    ".pr-empty-lib{text-align:center;padding:28px 22px}",
    ".pr-link{background:none;border:0;padding:0;font:600 13.5px Onest,sans-serif;color:#299D6B;cursor:pointer}",
    ".pr-link:hover{text-decoration:underline}",
    /* chosen panel */
    ".pr-panel{padding:18px 18px 6px}",
    ".pr-panel-h{display:flex;align-items:center;gap:8px;margin-bottom:6px}",
    ".pr-count{height:22px;min-width:22px;padding:0 7px;border-radius:999px;background:#F4F3FF;color:#5925DC;font:700 12px/22px Onest,sans-serif;text-align:center}",
    ".pr-col{margin:0 38px 0 auto}",
    ".pr-none{margin:6px 0 12px;font:400 13px/18px Onest,sans-serif;color:#667085}",
    ".pr-item{padding:12px 0;border-top:1px solid #F2F4F7;display:flex;flex-direction:column;gap:10px}",
    ".pr-item:first-of-type{border-top:0}",
    ".pr-item.is-flash{animation:pr-flash 1.2s ease-out}",
    "@keyframes pr-flash{from{background:#F4F3FF}to{background:transparent}}",
    ".pr-item-h{display:flex;align-items:center;gap:10px}",
    ".pr-item-h .pr-row-txt{line-height:18px}",
    ".pr-overlap{margin-top:2px;font:500 12px/16px Onest,sans-serif;color:#107569}",
    ".pr-x{flex:none;width:28px;height:28px;border-radius:50%;border:0;background:transparent;color:#98A2B3;cursor:pointer;display:grid;place-items:center}",
    ".pr-x:hover{background:#FEF3F2;color:#D92D20}",
    ".pr-field{display:flex;align-items:center;justify-content:space-between;gap:10px}",
    ".pr-field-l{font:600 13px/18px Onest,sans-serif;color:#344054}",
    ".pr-step{flex:none;display:flex;align-items:center;gap:4px}",
    ".pr-sb{width:36px;height:36px;border-radius:11px;border:1px solid #299D6B;background:#fff;color:#299D6B;font:600 18px/1 Onest,sans-serif;cursor:pointer;display:grid;place-items:center}",
    ".pr-sb:hover{background:#F3FCF8}",
    ".pr-sb:disabled{border-color:#E4E7EC;color:#D0D5DD;cursor:not-allowed;background:#fff}",
    ".pr-val{min-width:58px;text-align:center;font:700 14px Onest,sans-serif;color:#101828;white-space:nowrap}",
    ".pr-val span{font-weight:500;color:#667085;font-size:12.5px}",
    ".pr-habits{padding:12px;border-radius:14px;background:#F9FAFB;display:flex;flex-direction:column;gap:10px}",
    ".pr-chips{display:flex;flex-wrap:wrap;gap:6px}",
    ".pr-chip{display:inline-flex;align-items:center;gap:2px;height:28px;padding:0 2px 0 10px;border-radius:999px;background:#fff;border:1px solid #E4E7EC;color:#101828;font:600 12.5px Onest,sans-serif;max-width:100%}",
    ".pr-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".pr-chip button{width:22px;height:22px;border-radius:50%;border:0;background:transparent;color:#98A2B3;cursor:pointer;display:grid;place-items:center}",
    ".pr-chip button:hover{background:#FEF3F2;color:#D92D20}",
    ".pr-habits .pr-input{height:40px;background:#fff}",
    ".pr-hint{font:500 12px/16px Onest,sans-serif;color:#667085}",
    ".pr-hint.is-warn{color:#B54708;font-weight:600}",
    /* note */
    ".pr-note{padding:18px}",
    ".pr-note textarea{display:block;width:100%;min-height:88px;resize:vertical;background:#F3FCF8;border:1px solid #E4E7EC;border-radius:11px;padding:10px 14px;font:500 14px/20px Onest,sans-serif;color:#101828;outline:none}",
    ".pr-note textarea:focus-visible{border-color:#299D6B;box-shadow:0 0 0 3px rgba(41,157,107,.18);outline:none}",
    ".pr-note-f{margin-top:6px;text-align:right}",
    /* toast */
    ".pr-toast{position:fixed;left:50%;bottom:96px;transform:translate(-50%,12px);opacity:0;pointer-events:none;z-index:60;display:flex;align-items:center;gap:16px;padding:10px 12px 10px 16px;border-radius:12px;background:#101828;color:#fff;font:500 13.5px Onest,system-ui,sans-serif;box-shadow:0 12px 32px rgba(16,24,40,.24);transition:opacity .2s ease,transform .2s ease}",
    ".pr-toast.is-on{opacity:1;transform:translate(-50%,0);pointer-events:auto}",
    ".pr-toast button{height:30px;padding:0 12px;border-radius:8px;border:0;background:#fff;color:#1D4D38;font:600 13px Onest,sans-serif;cursor:pointer}",
    ".pr-toast button:focus-visible{outline:2px solid #6CE9A6;outline-offset:2px}"
  ].join("\n");

  var ICON = {
    search: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.8"/><path d="M13.5 13.5 17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tick: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m3 7.2 2.6 2.6L11 4.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };

  function injectCSS() {
    if (document.getElementById("pr-css")) return;
    var s = document.createElement("style"); s.id = "pr-css"; s.textContent = CSS; document.head.appendChild(s);
  }
  function themeName(key) { var t = MP.THEMES.filter(function (x) { return x[0] === key; })[0]; return t ? t[1] : ""; }
  function chosen(plan, id) { for (var i = 0; i < plan.practices.length; i++) if (plan.practices[i].id === id) return i; return -1; }
  function overlapNote(plan, p) {
    if (!p.overlaps) return "";
    var names = ((plan.rhythm && plan.rhythm.breathing) || []).map(function (b) { return String(b.name).toLowerCase(); });
    if (names.indexOf(p.overlaps.toLowerCase()) < 0) return "";
    return '<div class="pr-overlap">Already in the Rhythm</div>';
  }
  function stepper(k, val, min, max, unit1, unitN, what) {
    return '<div class="pr-step">' +
      '<button type="button" class="pr-sb" data-k="' + k + '-dn" data-act="' + k + '" data-d="-1" aria-label="Fewer ' + what + '"' + (val <= min ? ' disabled title="' + min + ' is the least"' : '') + '>&minus;</button>' +
      '<div class="pr-val" aria-live="polite">' + val + ' <span>' + (val === 1 ? unit1 : unitN) + '</span></div>' +
      '<button type="button" class="pr-sb" data-k="' + k + '-up" data-act="' + k + '" data-d="1" aria-label="More ' + what + '"' + (val >= max ? ' disabled title="' + max + ' is the most"' : '') + '>+</button>' +
    '</div>';
  }

  /* one toast for the module, shared across renders */
  var toast = { el: null, timer: 0, undo: null };
  function showToast(msg, undo) {
    if (!toast.el) {
      toast.el = document.createElement("div"); toast.el.className = "pr-toast"; toast.el.setAttribute("role", "status");
      document.body.appendChild(toast.el);
      toast.el.addEventListener("click", function (e) {
        if (e.target.closest("button") && toast.undo) { var u = toast.undo; hideToast(); u(); }
      });
    }
    toast.undo = undo;
    toast.el.innerHTML = '<span>' + esc(msg) + '</span><button type="button">Undo</button>';
    toast.el.classList.add("is-on");
    clearTimeout(toast.timer); toast.timer = setTimeout(hideToast, 6000);
  }
  function hideToast() { if (toast.el) toast.el.classList.remove("is-on"); toast.undo = null; clearTimeout(toast.timer); }

  MP.steps.practices = {
    title: "Coach's practices",
    sub: function (plan) { var n = (plan.practices || []).length; return n ? "Not scored, " + n + " chosen" : "Not scored"; },

    valid: function (plan) {
      var bad = (plan.practices || []).some(function (x) { var p = H.practice(x.id); return p && p.kind === "habit" && !(x.habits && x.habits.length); });
      return bad ? "Add at least one habit to the Habit Tracker, or remove it." : null;
    },

    render: function (el, plan, ctx) {
      injectCSS();
      if (!plan.practices) plan.practices = [];
      if (plan.note == null) plan.note = "";
      var state = { q: "", theme: "all", flash: null, focusHabit: null };

      el.innerHTML =
        '<div class="pr-root">' +
          '<header><h1 class="pr-h1">Coach\'s practices</h1>' +
          '<p class="pr-intro">Exercises from you, outside the Rhythm score. Pick a few and set how often each is filled in.</p></header>' +
          '<div class="pr-card pr-top">' +
            '<div class="pr-search">' + ICON.search + '<input class="pr-input" type="search" data-k="q" placeholder="Search practices, for example worry or sleep" aria-label="Search practices"></div>' +
            '<div class="pr-pills" role="group" aria-label="Filter by theme"></div>' +
          '</div>' +
          '<div class="pr-cols"><div class="pr-lib" aria-label="Practice library"></div><aside class="pr-side" aria-label="Chosen for this plan"></aside></div>' +
        '</div>';

      var $q = el.querySelector("[data-k=q]"), $pills = el.querySelector(".pr-pills"), $lib = el.querySelector(".pr-lib"), $side = el.querySelector(".pr-side");

      function matches(p) {
        var q = state.q.trim().toLowerCase();
        return !q || (p.name + " " + p.desc + " " + themeName(p.theme)).toLowerCase().indexOf(q) >= 0;
      }
      function keepFocus(box, fn) {
        var a = document.activeElement, k = a && box.contains(a) ? a.getAttribute("data-k") : null;
        fn();
        if (k) { var n = box.querySelector('[data-k="' + k + '"]'); if (n && !n.disabled) n.focus(); else if (n) { var alt = n.parentNode.querySelector("button:not(:disabled)"); if (alt) alt.focus(); } }
      }

      function drawPills() {
        var hits = MP.PRACTICES.filter(matches);
        var html = '<button type="button" class="pr-pill" data-k="th-all" data-theme="all" aria-pressed="' + (state.theme === "all") + '">All</button>';
        MP.THEMES.forEach(function (t) {
          var n = hits.filter(function (p) { return p.theme === t[0]; }).length;
          html += '<button type="button" class="pr-pill" data-k="th-' + t[0] + '" data-theme="' + t[0] + '" aria-pressed="' + (state.theme === t[0]) + '"' + (n ? '' : ' disabled') + '>' + esc(t[1]) + '</button>';
        });
        keepFocus($pills, function () { $pills.innerHTML = html; });
      }

      function drawLib() {
        var html = "", any = false;
        MP.THEMES.forEach(function (t) {
          if (state.theme !== "all" && state.theme !== t[0]) return;
          var list = MP.PRACTICES.filter(function (p) { return p.theme === t[0] && matches(p); });
          if (!list.length) return;
          any = true;
          html += '<section class="pr-card pr-theme"><h2 class="pr-h2">' + esc(t[1]) + '</h2>';
          list.forEach(function (p) {
            var on = chosen(plan, p.id) >= 0;
            html += '<div class="pr-row"><div class="pr-row-txt"><div class="pr-name">' + esc(p.name) + '</div><div class="pr-desc">' + esc(p.desc) + '</div></div>' +
              (on ? '<button type="button" class="pr-add is-added" data-k="add-' + p.id + '" data-show="' + p.id + '" aria-label="' + esc(p.name) + ' added. Show it in the chosen list" title="Added">' + ICON.tick + '</button>'
                  : '<button type="button" class="pr-add" data-k="add-' + p.id + '" data-add="' + p.id + '" aria-label="Add ' + esc(p.name) + '" title="Add">' + ICON.plus + '</button>') +
            '</div>';
          });
          html += '</section>';
        });
        if (!any) html = '<div class="pr-card pr-empty-lib"><div class="pr-name">No practice matches “' + esc(state.q.trim()) + '”</div><p class="pr-desc" style="margin:4px 0 10px">Try a shorter word, or look through every theme.</p><button type="button" class="pr-link" data-clear>Clear Search</button></div>';
        keepFocus($lib, function () { $lib.innerHTML = html; });
      }

      function drawSide() {
        var n = plan.practices.length, html = '<section class="pr-card pr-panel"><div class="pr-panel-h"><h2 class="pr-h2">Chosen</h2><span class="pr-count">' + n + '</span>' + (n ? '<span class="pr-label pr-col">Times to fill</span>' : '') + '</div>';
        if (!n) {
          html += '<p class="pr-none">Nothing yet. Add a practice from the library.</p>';
        } else {
          plan.practices.forEach(function (x) {
            var p = H.practice(x.id); if (!p) return;
            html += '<div class="pr-item' + (state.flash === x.id ? ' is-flash' : '') + '" data-item="' + x.id + '">' +
              '<div class="pr-item-h"><div class="pr-row-txt"><div class="pr-name">' + esc(p.name) + '</div>' + overlapNote(plan, p) + '</div>' +
              stepper("times-" + x.id, x.times || 1, TIMES_MIN, TIMES_MAX, "time", "times", "times to fill") +
              '<button type="button" class="pr-x" data-k="rm-' + x.id + '" data-rm="' + x.id + '" aria-label="Remove ' + esc(p.name) + '" title="Remove">' + ICON.x + '</button></div>';
            if (p.kind === "habit") {
              var hs = x.habits || [], full = hs.length >= HABITS_MAX;
              html += '<div class="pr-habits">' +
                (hs.length ? '<div class="pr-chips">' + hs.map(function (h, j) { return '<span class="pr-chip"><span title="' + esc(h) + '">' + esc(h) + '</span><button type="button" data-k="hx-' + j + '" data-hrm="' + j + '" data-of="' + x.id + '" aria-label="Remove habit ' + esc(h) + '">' + ICON.x + '</button></span>'; }).join("") + '</div>' : '') +
                (full ? '' : '<input class="pr-input" data-k="hin-' + x.id + '" data-hin="' + x.id + '" maxlength="60" placeholder="Type a habit, then press Enter" aria-label="Add a habit">') +
                '<div class="pr-hint' + (hs.length ? '' : ' is-warn') + '">' + (hs.length ? hs.length + ' of ' + HABITS_MAX + ' habits, shown every day of the plan' : 'Add at least one habit') + '</div>' +
              '</div>';
            }
            html += '</div>';
          });
        }
        html += '</section>';
        html += '<section class="pr-card pr-note"><label class="pr-label" for="pr-note-ta">Note for the patient</label>' +
          '<textarea id="pr-note-ta" data-k="note" maxlength="' + NOTE_MAX + '" placeholder="For example: Start with the Worry Tree on a calm evening.">' + esc(plan.note) + '</textarea>' +
          '<div class="pr-note-f"><span class="pr-hint" data-notecount>' + plan.note.length + ' of ' + NOTE_MAX + '</span></div></section>';
        var focusHabit = state.focusHabit; state.focusHabit = null;
        keepFocus($side, function () { $side.innerHTML = html; });
        if (focusHabit) { var hin = $side.querySelector('[data-hin="' + focusHabit + '"]'); if (hin) hin.focus(); }
        state.flash = null;
      }

      function drawAll() { drawPills(); drawLib(); drawSide(); }
      function changed() { drawLib(); drawSide(); MP.changed(); }

      function add(id) {
        if (chosen(plan, id) >= 0) return;
        var p = H.practice(id), item = { id: id, times: 1 };
        if (p.kind === "habit") { item.habits = []; state.focusHabit = id; }   /* it runs for the whole plan, so no weeks */
        plan.practices.push(item); state.flash = id;
        var keep = document.activeElement === $lib.querySelector('[data-k="add-' + id + '"]');
        changed();
        if (keep && !state.focusHabit) { var b = $lib.querySelector('[data-k="add-' + id + '"]'); if (b) b.focus(); }
      }
      function remove(id) {
        var i = chosen(plan, id); if (i < 0) return;
        var was = plan.practices.splice(i, 1)[0], p = H.practice(id);
        changed();
        var next = $side.querySelector(".pr-x") || $lib.querySelector('[data-k="add-' + id + '"]'); if (next) next.focus();
        showToast(p.name + " removed", function () {
          if (chosen(plan, id) >= 0) return;
          plan.practices.splice(Math.min(i, plan.practices.length), 0, was); state.flash = id; changed();
        });
      }
      function addHabit(id, text) {
        var x = plan.practices[chosen(plan, id)]; text = String(text || "").trim();
        if (!x || !text) return;
        x.habits = x.habits || [];
        if (x.habits.length >= HABITS_MAX) return;
        if (x.habits.some(function (h) { return h.toLowerCase() === text.toLowerCase(); })) return;
        x.habits.push(text); state.focusHabit = id; changed();
      }

      /* events, delegated */
      $q.addEventListener("input", function () { state.q = $q.value; if (state.theme !== "all" && !MP.PRACTICES.some(function (p) { return p.theme === state.theme && matches(p); })) state.theme = "all"; drawPills(); drawLib(); });
      $q.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); var b = $lib.querySelector(".pr-add"); if (b) b.focus(); }
        if (e.key === "Escape" && $q.value) { e.preventDefault(); $q.value = ""; state.q = ""; drawPills(); drawLib(); }
      });
      $pills.addEventListener("click", function (e) {
        var b = e.target.closest("[data-theme]"); if (!b || b.disabled) return;
        state.theme = b.getAttribute("data-theme"); drawPills(); drawLib();
      });
      $lib.addEventListener("click", function (e) {
        var a = e.target.closest("[data-add]"), s = e.target.closest("[data-show]"), c = e.target.closest("[data-clear]");
        if (a) add(a.getAttribute("data-add"));
        if (s) { var it = $side.querySelector('[data-item="' + s.getAttribute("data-show") + '"]'); if (it) { it.scrollIntoView({ block: "nearest", behavior: "smooth" }); it.classList.remove("is-flash"); void it.offsetWidth; it.classList.add("is-flash"); } }
        if (c) { $q.value = ""; state.q = ""; state.theme = "all"; drawPills(); drawLib(); $q.focus(); }
      });
      $side.addEventListener("click", function (e) {
        var t = e.target.closest("button"); if (!t) return;
        if (t.hasAttribute("data-rm")) return remove(t.getAttribute("data-rm"));
        if (t.hasAttribute("data-hrm")) {
          var x = plan.practices[chosen(plan, t.getAttribute("data-of"))], j = +t.getAttribute("data-hrm"), h = x.habits[j];
          x.habits.splice(j, 1); changed();
          var hin = $side.querySelector('[data-hin="' + x.id + '"]'); if (hin) hin.focus();
          return showToast("Habit removed", function () { x.habits.splice(Math.min(j, x.habits.length), 0, h); changed(); });
        }
        var act = t.getAttribute("data-act");
        if (act && !t.disabled) {
          var d = +t.getAttribute("data-d"), m = act.match(/^(times|weeks)-(.+)$/), it = plan.practices[chosen(plan, m[2])];
          if (m[1] === "times") it.times = Math.max(TIMES_MIN, Math.min(TIMES_MAX, (it.times || 1) + d));
          else it.weeks = Math.max(WEEKS_MIN, Math.min(WEEKS_MAX, (it.weeks || 4) + d));
          changed();
        }
      });
      $side.addEventListener("keydown", function (e) {
        var hin = e.target.closest && e.target.closest("[data-hin]");
        if (hin && e.key === "Enter") { e.preventDefault(); addHabit(hin.getAttribute("data-hin"), hin.value); }
      });
      $side.addEventListener("input", function (e) {
        if (e.target.getAttribute("data-k") === "note") {
          plan.note = e.target.value.slice(0, NOTE_MAX);
          $side.querySelector("[data-notecount]").textContent = plan.note.length + " of " + NOTE_MAX;
          MP.changed();
        }
      });

      drawAll();
    }
  };
})();
