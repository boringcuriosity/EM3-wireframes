/* Mind plan, coach portal: step 4, Review and assign (prefix rv-).
   Every scored choice summarised, grouped by the score's halves, with Edit links back to its step. One reading column.
   17 Nov 2026: the patient phone preview and the Coach's practices card (with the note) left the review; the practices
   step itself shows what is picked and the note. Scoring rules sit behind "How it is scored" (a <details>), not in the row.
   Reads the plan only. ctx.readOnly hides every Edit and Fix link (the host's "View" of an assigned plan). */
(function () {
  var MP = window.MP = window.MP || {};
  MP.steps = MP.steps || {};
  var H = MP.helpers, esc = H.esc, t12 = H.t12;

  /* ---------- problems from the other steps ---------- */
  var STEPS = [["sleep", "Sleep"], ["selfcare", "Self-care"], ["practices", "Coach's practices"]];
  /* used only when a step's own module is not loaded (the harness loads this file alone) */
  var FALLBACK = {
    sleep: function (p, mode) {
      if (mode !== "template" && !String(p.name || "").trim()) return "Give the plan a name.";
      if (mode !== "template" && p.end < p.start) return "The end date is before the start date.";
      if (!p.rhythm.winddown.length) return "Add at least one wind-down task.";
      return null;
    },
    selfcare: function (p) {
      if (!p.rhythm.breathing.length) return "Add a breathing exercise.";
      if (!p.rhythm.metime.length) return "Choose a me-time activity.";
      return null;
    },
    practices: function (p) {
      var h = p.practices.filter(function (x) { return x.id === "habit-tracker" && !(x.habits || []).length; })[0];
      return h ? "Add at least one habit to the Habit Tracker." : null;
    }
  };
  function problems(plan, mode) {
    var out = [];
    STEPS.forEach(function (s) {
      var m = MP.steps[s[0]], msg = null;
      try { msg = m && m.valid ? m.valid(plan) : FALLBACK[s[0]](plan, mode); } catch (e) { msg = null; }
      if (msg) out.push({ key: s[0], step: s[1], msg: msg });
    });
    return out;
  }
  var lastMode = "plan";

  /* ---------- small helpers ---------- */
  var mins = function (hm) { return +hm.slice(0, 2) * 60 + +hm.slice(3); };
  var pts = function (w, n) { var v = w / n; return (Math.round(v * 10) / 10).toString(); };
  var plural = function (n, one, many) { return n + " " + (n === 1 ? one : many); };
  function span(plan) {
    var d = Math.round((new Date(plan.end + "T00:00") - new Date(plan.start + "T00:00")) / 864e5) + 1;
    if (!(d > 0)) return "";
    var w = Math.floor(d / 7), r = d % 7;
    return w && !r ? plural(w, "week", "weeks") : plural(d, "day", "days");   /* whole weeks read as weeks, anything else as days: 15 days */
  }
  function hoursText(h) { return (h % 1 ? h : h + "") + " hours"; }
  function minsText(m) { return m >= 60 && m % 60 === 0 ? plural(m / 60, "hour", "hours") : m + " min"; }
  var part = function (k) { return MP.PARTS.filter(function (p) { return p.key === k; })[0]; };

  /* ---------- the summary ---------- */
  var EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  function edit(ctx, key, label) { return ctx.readOnly ? "" : '<button type="button" class="rv-edit" data-go="' + key + '" aria-label="Edit ' + label + '">' + EDIT + 'Edit</button>'; }
  function chip(k) { var p = part(k); return '<span class="rv-pts rv-' + p.colour + '">' + p.w + ' pts</span>'; }
  /* how a part is scored, one or two plain sentences, opened on demand; only where the row does not already show it */
  var RULE = {
    hours: "Full points at the target, naps included. Fewer the shorter the day's sleep, none at 3 hours short.",
    window: "Full points when bedtime and wake-up are each within 30 minutes of the plan. Fewer the further off, none at 2 hours. Naps never move it.",
    mood: "Any answer counts. A low mood never costs points."
  };
  function line(k, value, extra) {
    var p = part(k);
    return '<div class="rv-line"><div class="rv-lh"><span class="rv-ln">' + p.name + '</span>' + chip(k) + '</div>' +
      (value ? '<div class="rv-lv">' + value + '</div>' : "") + (extra || "") +
      (RULE[k] ? '<details class="rv-how"><summary>How it is scored</summary><p>' + RULE[k] + '</p></details>' : "") + '</div>';
  }
  function empty(text, ctx, key, cta) {
    return '<div class="rv-empty">' + text + (ctx.readOnly || !cta ? "" : ' <button type="button" class="rv-link" data-go="' + key + '">' + cta + '</button>') + '</div>';
  }

  function headerCard(plan, ctx) {
    var tpl = ctx.mode === "template";
    var meta = tpl ? ['<span class="rv-meta">Template</span>'] : [
      '<span class="rv-meta">' + H.date(plan.start) + ' to ' + H.date(plan.end) + '</span>',
      span(plan) ? '<span class="rv-meta">' + span(plan) + '</span>' : "",
      '<span class="rv-meta">' + esc(MP.PATIENT.name) + '</span>'
    ];
    return '<section class="rv-card rv-head"><div class="rv-cap">' + (tpl ? "Mind template" : "Mind plan") + '</div>' +
      '<div class="rv-name">' + (String(plan.name || "").trim() ? esc(plan.name) : '<span class="rv-muted">No name yet</span>') + '</div>' +
      (tpl && plan.about ? '<p class="rv-about">' + esc(plan.about) + '</p>' : "") +
      '<div class="rv-metas">' + meta.join("") + '</div></section>';
  }

  function rhythmCard(plan, ctx) {
    var r = plan.rhythm, wd = r.winddown.filter(function (t) { return String(t.label || "").trim(); });
    var wdBody = wd.length ? '<ul class="rv-list">' + wd.map(function (t) {
      return '<li><span class="rv-lt">' + esc(t.label) + '</span><span class="rv-each">' + (t.at ? t12(t.at) + ', ' : '') + pts(part("winddown").w, wd.length) + ' pts</span></li>';
    }).join("") + '</ul>' : empty("No wind-down tasks yet. These are the small steps before bed.", ctx, "sleep", "Add Tasks");
    var br = r.breathing, me = r.metime.filter(function (m) { return String(m.label || "").trim(); });
    var brBody = br.length ? '<ul class="rv-list">' + br.map(function (b) {
      return '<li><span class="rv-lt">' + esc(MP.breathName(b.name)) + ', ' + b.mins + ' min</span><span class="rv-each">' + t12(b.at) + ', ' + pts(10, br.length) + ' pts</span></li>';
    }).join("") + '</ul>' : empty("No breathing exercise yet.", ctx, "selfcare", "Add Breathing");
    var meBody = me.length ? '<ul class="rv-list">' + me.map(function (m) { return '<li><span class="rv-lt">' + esc(m.label) + '</span><span class="rv-each">' + t12(m.at) + ', 10 pts</span></li>'; }).join("") + '</ul>' : empty("No me-time activity yet.", ctx, "selfcare", "Choose One");
    var mo = r.mood.checks;
    var moBody = '<ul class="rv-list">' + mo.map(function (c, i) { return '<li><span class="rv-lt">' + ((function (h) { return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening"; })(+c.at.slice(0, 2)) + " check-in") + '</span><span class="rv-each">' + t12(c.at) + ', ' + pts(10, mo.length) + ' pts</span></li>'; }).join("") + '</ul>';
    return '<section class="rv-card rv-rhythm"><div class="rv-ch"><div><h3 class="rv-h">Rhythm score, out of 100 pts</h3>' +
      '<p class="rv-hs">' + (ctx.mode === "template" ? "The patient's" : esc(MP.PATIENT.name) + "'s") + ' Mind score each day. The points for each part are fixed.</p></div></div>' +
      '<div class="rv-half rv-in"><div class="rv-hh"><span class="rv-hn">Sleep</span><span class="rv-hp">70 pts</span>' + edit(ctx, "sleep", "sleep") + '</div>' +
        line("hours", r.second ? hoursText(r.hours + r.second.hours) + " a day, in two windows" : hoursText(r.hours) + " a day, naps included") +
        line("window", t12(r.bedtime) + " bedtime to " + t12(r.wake) + " wake" + (r.second ? ", and " + t12(r.second.bedtime) + " to " + t12(r.second.wake) : "")) +
        line("winddown", wd.length ? plural(wd.length, "task", "tasks") + " before bed" : "", wdBody) +
      '</div>' +
      '<div class="rv-half rv-sc"><div class="rv-hh"><span class="rv-hn">Self-care</span><span class="rv-hp">30 pts</span>' + edit(ctx, "selfcare", "self-care") + '</div>' +
        line("breathing", br.length ? plural(br.length, "exercise", "exercises") + " a day" : "", brBody) +
        line("metime", me.length ? "1 activity a day" : "", meBody) +
        line("mood", plural(mo.length, "check-in", "check-ins") + " a day", moBody) +
      '</div></section>';
  }

  function banner(list, ctx) {
    if (!list.length) return "";
    return '<div class="rv-banner" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>' +
      '<div><div class="rv-bt">' + (list.length === 1 ? "One thing to finish" : list.length + " things to finish") + ' before you ' + (ctx.mode === "template" ? "save" : "assign") + '</div><ul>' +
      list.map(function (p) { return '<li><span>' + esc(p.step) + ': ' + esc(p.msg) + '</span>' + (ctx.readOnly ? "" : ' <button type="button" class="rv-link" data-go="' + p.key + '">Fix It</button>') + '</li>'; }).join("") +
      '</ul></div></div>';
  }

  /* ---------- CSS, once ---------- */
  var CSS = [
    ".rv-wrap{display:grid;gap:24px;align-items:start;font:400 13.5px/20px Onest,system-ui,sans-serif;color:#475467}",
    ".rv-wrap{max-width:720px;margin:0 auto}",
    ".rv-main{display:flex;flex-direction:column;gap:16px;min-width:0}",
    ".rv-title{margin:0;font:800 22px/30px Montserrat,sans-serif;color:#1D4D38}",
    ".rv-intro{margin:4px 0 0}",
    ".rv-card{background:#fff;border:1px solid #E4E7EC;border-radius:18px;padding:20px 22px}",
    ".rv-cap{font:700 11px/16px Onest,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#475467}",
    ".rv-name{margin-top:4px;font:800 18px/26px Montserrat,sans-serif;color:#1D4D38}",
    ".rv-about{margin:4px 0 0}",
    ".rv-metas{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}",
    ".rv-meta{display:inline-flex;align-items:center;height:28px;padding:0 12px;border-radius:999px;background:#F3FCF8;border:1px solid #E4E7EC;font:600 13px/18px Onest,sans-serif;color:#101828}",
    ".rv-ch{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}",
    ".rv-h{margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:800 16px/24px Montserrat,sans-serif;color:#1D4D38}",
    ".rv-hs{margin:2px 0 0}",
    ".rv-muted{color:#98A2B3}",
    ".rv-edit{flex:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px;margin:-4px -10px 0 auto;border:0;border-radius:9px;background:none;color:#299D6B;font:600 13.5px/20px Onest,sans-serif;cursor:pointer}",
    ".rv-edit svg{width:15px;height:15px}",
    ".rv-edit:hover{background:#F3FCF8}",
    ".rv-edit:focus-visible,.rv-link:focus-visible{outline:2px solid #299D6B;outline-offset:2px}",
    ".rv-link{border:0;padding:0;background:none;color:#299D6B;font:600 13.5px/20px Onest,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}",
    ".rv-half{margin-top:16px;border-radius:14px;padding:4px 16px 8px;border:1px solid transparent}",
    ".rv-half.rv-in{background:#F8FAFF;border-color:#E0EAFF}",
    ".rv-half.rv-sc{background:#FCFCFD;border-color:#EAECF0}",
    ".rv-hh{display:flex;align-items:center;gap:10px;padding:10px 0}",
    ".rv-hn{font:800 15px/22px Montserrat,sans-serif;color:#1D4D38}",
    ".rv-hp{font:700 12px/16px Onest,sans-serif;color:#475467}",
    ".rv-line{padding:12px 0;border-top:1px solid #EAECF0}",
    ".rv-lh{display:flex;align-items:center;gap:8px}",
    ".rv-ln{font:600 13.5px/20px Onest,sans-serif;color:#101828}",
    ".rv-lv{margin-top:2px;color:#344054}",
    ".rv-ls{font-size:12.5px;line-height:18px;color:#667085}",
    /* How it is scored: a quiet link that opens one or two sentences */
    ".rv-how{margin-top:6px}",
    ".rv-how summary{display:inline-flex;align-items:center;gap:4px;min-height:28px;list-style:none;cursor:pointer;font:600 12.5px/18px Onest,sans-serif;color:#299D6B}",
    ".rv-how summary::-webkit-details-marker{display:none}",
    ".rv-how summary::after{content:'';width:7px;height:7px;margin:0 0 3px 4px;border:solid currentColor;border-width:0 1.6px 1.6px 0;transform:rotate(45deg);transition:transform .2s cubic-bezier(.4,0,.2,1)}",
    ".rv-how[open] summary::after{transform:rotate(-135deg);margin:3px 0 0 4px}",
    ".rv-how p{margin:4px 0 2px;padding:8px 12px;border-radius:10px;background:#fff;border:1px solid #EAECF0;font-size:13px;line-height:19px;color:#475467}",
    ".rv-pts{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font:700 11.5px/16px Onest,sans-serif;white-space:nowrap}",
    ".rv-pts.rv-in{color:#444CE7;background:#EEF4FF}.rv-pts.rv-teal{color:#0E9384;background:#F0FDF9}.rv-pts.rv-gold{color:#B54708;background:#FFFAEB}.rv-pts.rv-pink{color:#C11574;background:#FDF2FA}.rv-pts.rv-pu{color:#7A5AF8;background:#F4F3FF}",
    ".rv-list{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}",
    ".rv-list li{display:flex;align-items:baseline;gap:12px}",
    ".rv-time{flex:none;width:68px;font:600 13px/20px Onest,sans-serif;color:#444CE7;font-variant-numeric:tabular-nums}",
    ".rv-lt{flex:1;min-width:0;color:#344054}",
    ".rv-each{flex:none;font-size:12.5px;color:#667085;font-variant-numeric:tabular-nums}",
    ".rv-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}",
    ".rv-chip{display:inline-flex;align-items:center;min-height:26px;padding:2px 10px;border-radius:999px;background:#fff;border:1px solid #E4E7EC;font:500 13px/18px Onest,sans-serif;color:#344054}",
    ".rv-empty{margin-top:8px;padding:10px 12px;border-radius:11px;border:1px dashed #D0D5DD;background:#fff;color:#667085}",
    ".rv-plist{list-style:none;margin:12px 0 0;padding:0}",
    ".rv-plist li{display:flex;align-items:flex-start;gap:16px;padding:12px 0;border-top:1px solid #EAECF0}",
    ".rv-pm{flex:1;min-width:0;display:flex;flex-direction:column}",
    ".rv-pn{font:600 14px/20px Onest,sans-serif;color:#101828}",
    ".rv-pd{font-size:13px;line-height:18px;color:#667085}",
    ".rv-habit{display:flex;flex-direction:column;gap:4px}",
    ".rv-warn{margin-top:6px;font:600 12.5px/18px Onest,sans-serif;color:#B54708}",
    ".rv-fill{flex:none;display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;background:#F4F3FF;color:#6938EF;font:600 12.5px/18px Onest,sans-serif}",
    ".rv-note{margin-top:12px;padding:12px 14px;border-radius:12px;background:#F4F3FF}",
    ".rv-note p{margin:4px 0 0;color:#344054;white-space:pre-line}",
    ".rv-banner{display:flex;gap:12px;padding:14px 16px;border-radius:14px;background:#FFFAEB;border:1px solid #FEDF89;color:#93370D}",
    ".rv-banner>svg{flex:none;width:20px;height:20px;margin-top:1px;color:#DC6803}",
    ".rv-bt{font:600 14px/20px Onest,sans-serif;color:#7A2E0E}",
    ".rv-banner ul{margin:4px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px}"
  ].join("\n");
  function injectCSS() {
    if (document.getElementById("rv-css")) return;
    var s = document.createElement("style"); s.id = "rv-css"; s.textContent = CSS; document.head.appendChild(s);
  }

  MP.steps.review = {
    title: "Review and assign",
    sub: function (plan) { var p = problems(plan, lastMode)[0]; return p ? p.msg : "Ready"; },
    render: function (el, plan, ctx) {
      ctx = ctx || {}; lastMode = ctx.mode || "plan"; injectCSS();
      var tpl = ctx.mode === "template";
      this.title = tpl ? "Review template" : "Review and assign";
      var list = ctx.readOnly ? [] : problems(plan, lastMode);
      /* View (read only): the host's bar names the plan and its line gives the dates, so only the score card follows */
      el.innerHTML = '<div class="rv-wrap"><div class="rv-main">' + (ctx.readOnly ? "" : '<div><h2 class="rv-title">' + (tpl ? "Review template" : "Review and assign") + '</h2>' +
        '<p class="rv-intro">' + (tpl ? "Check the template before you save it. Each patient gets their own copy when you assign it." :
          "Check what " + esc(MP.PATIENT.name) + " will get, then assign the plan.") + '</p></div>') +
        banner(list, ctx) + (ctx.readOnly ? "" : headerCard(plan, ctx)) + rhythmCard(plan, ctx) + '</div></div>';
      el.onclick = function (e) {
        var b = e.target.closest("[data-go]");
        if (b && ctx.go) return ctx.go(b.getAttribute("data-go"));
      };
    },
    valid: function (plan) { var p = problems(plan, lastMode)[0]; return p ? p.step + ": " + p.msg : null; }
  };
})();
