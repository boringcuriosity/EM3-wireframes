/* Mind plan, coach portal: step 4, Review and assign (prefix rv-).
   Left: every choice summarised, grouped by the score's halves, with Edit links back to its step.
   Right: what the patient will see, a faithful sketch of the app's Mind plan (mind/layouts.js "parts", move/plan.css .mv-card).
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
    return w ? plural(w, "week", "weeks") + (r ? " " + plural(r, "day", "days") : "") : plural(d, "day", "days");
  }
  function hoursText(h) { return (h % 1 ? h : h + "") + " hours"; }
  function minsText(m) { return m >= 60 && m % 60 === 0 ? plural(m / 60, "hour", "hours") : m + " min"; }
  var part = function (k) { return MP.PARTS.filter(function (p) { return p.key === k; })[0]; };
  var once = function (n) { return n === 1 ? "Fill once" : "Fill " + n + " times"; };

  /* ---------- the summary ---------- */
  var EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  function edit(ctx, key, label) { return ctx.readOnly ? "" : '<button type="button" class="rv-edit" data-go="' + key + '" aria-label="Edit ' + label + '">' + EDIT + 'Edit</button>'; }
  function chip(k) { var p = part(k); return '<span class="rv-pts rv-' + p.colour + '">' + p.w + ' of 100</span>'; }
  function line(k, value, extra) {
    var p = part(k);
    return '<div class="rv-line"><div class="rv-lh"><span class="rv-ln">' + p.name + '</span>' + chip(k) + '</div>' +
      (value ? '<div class="rv-lv">' + value + '</div>' : "") + (extra || "") + '</div>';
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
      return '<li><span class="rv-lt">' + esc(t.label) + '</span><span class="rv-each">' + (t.at ? t12(t.at) + ', ' : '') + pts(23, wd.length) + ' pts</span></li>';
    }).join("") + '</ul>' : empty("No wind-down tasks yet. These are the small steps before bed.", ctx, "sleep", "Add Tasks");
    var br = r.breathing, me = r.metime.filter(function (m) { return String(m.label || "").trim(); });
    var brBody = br.length ? '<ul class="rv-list">' + br.map(function (b) {
      return '<li><span class="rv-lt">' + esc(b.name) + ', ' + b.mins + ' min</span><span class="rv-each">' + t12(b.at) + ', ' + pts(10, br.length) + ' pts</span></li>';
    }).join("") + '</ul>' : empty("No breathing exercise yet.", ctx, "selfcare", "Add Breathing");
    var meBody = me.length ? '<ul class="rv-list">' + me.map(function (m) { return '<li><span class="rv-lt">' + esc(m.label) + '</span><span class="rv-each">' + t12(m.at) + ', 10 pts</span></li>'; }).join("") + '</ul>' : empty("No me-time activity yet.", ctx, "selfcare", "Choose One");
    var mo = r.mood.checks;
    var moBody = '<ul class="rv-list">' + mo.map(function (c, i) { return '<li><span class="rv-lt">' + (i ? "Second check-in" : "Check-in") + '</span><span class="rv-each">' + t12(c.at) + ', ' + pts(10, mo.length) + ' pts</span></li>'; }).join("") + '</ul>';
    return '<section class="rv-card rv-rhythm"><div class="rv-ch"><div><h3 class="rv-h">Rhythm, scored out of 100</h3>' +
      '<p class="rv-hs">This makes ' + (ctx.mode === "template" ? "the patient's" : esc(MP.PATIENT.name) + "'s") + ' Mind score each day. The points are fixed.</p></div></div>' +
      '<div class="rv-half rv-in"><div class="rv-hh"><span class="rv-hn">Sleep</span><span class="rv-hp">70 points</span>' + edit(ctx, "sleep", "sleep") + '</div>' +
        line("hours", hoursText(r.hours) + " a night") +
        line("window", t12(r.bedtime) + " bedtime to " + t12(r.wake) + " wake", '<div class="rv-ls">The standard for everyone: full marks within 30 minutes of each time, fewer until 2 hours off.</div>') +
        line("winddown", wd.length ? (wd.length === 1 ? "1 task, it earns all 23" : wd.length + " tasks, each earns its share") : "", wdBody) +
      '</div>' +
      '<div class="rv-half rv-sc"><div class="rv-hh"><span class="rv-hn">Self-care</span><span class="rv-hp">30 points</span>' + edit(ctx, "selfcare", "self-care") + '</div>' +
        line("breathing", br.length ? (br.length === 1 ? "1 exercise a day, it earns all 10" : br.length + " exercises a day, each earns its share") : "", brBody) +
        line("metime", me.length ? "1 activity a day" : "", meBody) +
        line("mood", mo.length === 1 ? "1 check-in a day" : mo.length + " check-ins a day, each earns its share", moBody) +
      '</div></section>';
  }

  function practicesCard(plan, ctx) {
    var ps = plan.practices;
    var body = ps.length ? '<ul class="rv-plist">' + ps.map(function (x) {
      var p = H.practice(x.id) || { name: x.id, desc: "" };
      var habit = p.kind === "habit" ? '<div class="rv-habit">' + ((x.habits || []).length ?
        '<div class="rv-chips">' + x.habits.map(function (h) { return '<span class="rv-chip">' + esc(h) + '</span>'; }).join("") + '</div>' :
        '<span class="rv-warn">No habits yet</span>') + '<span class="rv-ls">Tracked every day of the plan</span></div>' : "";
      return '<li><div class="rv-pm"><span class="rv-pn">' + esc(p.name) + '</span><span class="rv-pd">' + esc(p.desc) + '</span>' + habit + '</div><span class="rv-fill">' + once(x.times || 1) + '</span></li>';
    }).join("") + '</ul>' : empty("No practices added. The Rhythm works on its own, practices are extra support.", ctx, "practices", "Add Practices");
    var note = String(plan.note || "").trim();
    return '<section class="rv-card rv-prac"><div class="rv-ch"><div><h3 class="rv-h">Coach\'s practices <span class="rv-pts rv-pu">Not scored</span></h3>' +
      '<p class="rv-hs">' + (ps.length ? plural(ps.length, "practice", "practices") + " from the reflection templates" : "Templates the patient fills in") + '</p></div>' + edit(ctx, "practices", "practices") + '</div>' + body +
      '<div class="rv-note"><div class="rv-cap">Note for ' + (ctx.mode === "template" ? "the patient" : esc(MP.PATIENT.name)) + '</div>' +
      (note ? '<p>' + esc(note) + '</p>' : '<p class="rv-muted">No note. That is fine.</p>') + '</div></section>';
  }

  function banner(list, ctx) {
    if (!list.length) return "";
    return '<div class="rv-banner" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>' +
      '<div><div class="rv-bt">' + (list.length === 1 ? "One thing to finish" : list.length + " things to finish") + ' before you ' + (ctx.mode === "template" ? "save" : "assign") + '</div><ul>' +
      list.map(function (p) { return '<li><span>' + esc(p.step) + ': ' + esc(p.msg) + '</span>' + (ctx.readOnly ? "" : ' <button type="button" class="rv-link" data-go="' + p.key + '">Fix It</button>') + '</li>'; }).join("") +
      '</ul></div></div>';
  }

  /* ---------- the phone: what the patient sees ---------- */
  var ICS = {
    breath: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
    me: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    mood: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'
  };
  function prow(t, d, right) {
    return '<div class="rv-pr"><span class="rv-tk"></span><span class="rv-pt"><b>' + t + '</b>' + (d ? '<small>' + d + '</small>' : "") + '</span>' + (right ? '<span class="rv-ptm">' + right + '</span>' : "") + '</div>';
  }
  function pcard(title, sub, rows, scene, emptyText) {
    return '<section class="rv-pc" style="--scene:url(/v7/icons/meals/bg/' + scene + '.webp?v=2)"><div class="rv-pch"><div class="rv-pcn">' + title + '</div><div class="rv-pcs">' + sub + '</div></div>' +
      '<div class="rv-pcb">' + (rows.length ? rows.map(function (r) { return r.html; }).join("") : '<div class="rv-pe">' + emptyText + '</div>') + '</div></section>';
  }

  /* the real Mind screen (mind/screen.html, Parts of the day), filled with this plan: tap, log and watch the Rhythm score move */
  function phone(plan, ctx) {
    var who = ctx.mode === "template" ? "the patient" : esc(MP.PATIENT.name);
    var one = function (layout, name) {
      return '<figure class="rv-fig"><figcaption class="rv-fcap">' + name + '</figcaption><div class="rv-phone"><iframe class="rv-app" title="The Mind screen with this plan, ' + name + '" src="/mind/screen.html?coach=1&layout=' + layout + '&day=start&now=15&tiles=0&t=' + Date.now() + '"></iframe></div></figure>';
    };
    return '<aside class="rv-side" aria-label="Preview of the app"><div class="rv-cap rv-sidecap">What ' + who + ' will see</div>' +
      '<p class="rv-try">The app itself, with this plan, in two layouts. Tick things off and log last night to watch the score grow. Nothing here is saved.</p>' +
      '<div class="rv-phones">' + one("parts", "Parts of the day") + one("cards", "A card for each practice") + '</div>' +
      '<button type="button" class="rv-reset" data-reload="1">Start the day again</button></aside>';
  }

  /* ---------- CSS, once ---------- */
  var CSS = [
    ".rv-wrap{display:grid;gap:24px;align-items:start;font:400 14px/20px Onest,system-ui,sans-serif;color:#475467}",
    /* two phones beside the summary: the step widens past the flow's column to make room */
    "@media (min-width:1200px){.rv-wrap{grid-template-columns:minmax(0,1fr) auto;width:min(1400px,calc(100vw - 48px));margin-left:calc(50% - min(700px,50vw - 24px))}}",
    ".rv-phones{display:flex;gap:20px;flex-wrap:wrap}",
    ".rv-fig{margin:0;display:flex;flex-direction:column;gap:8px}",
    ".rv-fcap{font:600 13px/18px Onest,sans-serif;color:#101828}",
    ".rv-main{display:flex;flex-direction:column;gap:16px;min-width:0}",
    ".rv-title{margin:0;font:800 24px/32px Montserrat,sans-serif;color:#1D4D38}",
    ".rv-intro{margin:4px 0 0}",
    ".rv-card{background:#fff;border:1px solid #E4E7EC;border-radius:18px;padding:20px 22px}",
    ".rv-cap{font:700 11px/16px Onest,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#475467}",
    ".rv-name{margin-top:4px;font:800 20px/28px Montserrat,sans-serif;color:#1D4D38}",
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
    ".rv-ln{font:600 14px/20px Onest,sans-serif;color:#101828}",
    ".rv-lv{margin-top:2px;color:#344054}",
    ".rv-ls{font-size:12.5px;line-height:18px;color:#667085}",
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
    ".rv-banner ul{margin:4px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px}",
    /* the phone */
    ".rv-side{position:sticky;top:24px}",
    ".rv-sidecap{margin:0 0 10px 4px}",
    ".rv-phone{width:360px;max-width:100%;border-radius:40px;padding:8px;background:#fff;border:1px solid #E4E7EC;box-shadow:0 12px 32px -12px rgba(16,24,40,.18)}",
    ".rv-scr{height:min(760px,calc(100vh - 96px));overflow:auto;border-radius:32px;background:#fff;padding:0 12px 24px;font:400 14px/20px Roboto,system-ui,sans-serif;color:#101828;scrollbar-width:thin}",
    ".rv-sb{display:flex;justify-content:space-between;padding:14px 10px 6px;font-size:14px}",
    ".rv-top{display:flex;align-items:baseline;gap:8px;padding:8px 4px}",
    ".rv-top b{font-size:16px}.rv-top span{font-size:12px;color:#667085}",
    ".rv-day{margin:6px auto 0;width:max-content;padding:6px 14px;border-radius:999px;background:#F9FAFB;font:600 13px/18px Roboto,sans-serif}",
    ".rv-ring{position:relative;width:150px;height:150px;margin:16px auto 8px}",
    ".rv-ring svg{width:100%;height:100%}",
    ".rv-rv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}",
    ".rv-rv b{font-size:30px;line-height:36px;color:#3538CD}.rv-rv span{font-size:12px;color:#667085}",
    ".rv-lab{margin:16px 4px 10px;font-size:14px;font-weight:500;color:#344054}",
    ".rv-pc{position:relative;isolation:isolate;margin-bottom:12px;border-radius:20px;border:1px solid transparent;box-shadow:2px 2px 0 #E4E7EC;",
    "background:linear-gradient(180deg,#F5F8FF 0%,#fff 29%,#fff 100%) padding-box,conic-gradient(from 0deg,#444CE7 0deg,#E4E7EC 43deg,#E4E7EC 317deg,#444CE7 360deg) border-box}",
    ".rv-pc::before{content:'';position:absolute;inset:0 0 auto 0;height:100%;max-height:110px;z-index:-1;border-radius:inherit;opacity:.45;background:var(--scene) right top/auto 100% no-repeat;",
    "-webkit-mask:linear-gradient(90deg,transparent 18%,#000 62%),linear-gradient(180deg,#000 45%,transparent);-webkit-mask-composite:source-in;mask-composite:intersect}",
    ".rv-pcu{background:linear-gradient(180deg,#F4F3FF 0%,#fff 35%,#fff 100%) padding-box,conic-gradient(from 0deg,#7A5AF8 0deg,#E4E7EC 43deg,#E4E7EC 317deg,#7A5AF8 360deg) border-box}",
    ".rv-pcu::before{display:none}",
    ".rv-pch{padding:14px 14px 10px}",
    ".rv-pcn{font-size:16px;line-height:22px;font-weight:600}",
    ".rv-pcs{font-size:12px;line-height:18px;color:#667085;margin-top:2px}",
    ".rv-pcb{margin:0 14px;padding:10px 0 14px;border-top:1px solid #F2F4F7;display:flex;flex-direction:column;gap:10px}",
    ".rv-pr{display:flex;gap:12px;align-items:flex-start}",
    ".rv-tk{flex:none;width:22px;height:22px;border-radius:999px;border:1.5px solid #D0D5DD;background:#fff}",
    ".rv-app{display:block;width:100%;height:740px;border:0;border-radius:32px;background:#fff}",
    ".rv-reset{display:block;margin:10px auto 0;border:0;background:none;padding:2px 0;font:600 12.5px/16px Onest,sans-serif;color:#299D6B;cursor:pointer}",
    ".rv-try{margin:-4px 0 10px;font:400 12.5px/18px Onest,sans-serif;color:#667085}",
    ".rv-pi{flex:none;display:grid;place-items:center;width:22px;height:22px;color:#7A5AF8}.rv-pi svg{width:18px;height:18px}",
    ".rv-pt{flex:1;min-width:0;display:flex;flex-direction:column}",
    ".rv-pt b{font-size:13.5px;line-height:19px;font-weight:600}",
    ".rv-pt small{font-size:12px;line-height:17px;color:#667085;margin-top:1px}",
    ".rv-ptm{flex:none;font-size:12px;line-height:19px;color:#667085;white-space:nowrap}",
    ".rv-pcu .rv-ptm{color:#6938EF;font-weight:600}",
    ".rv-pe{font-size:12.5px;line-height:18px;color:#98A2B3}",
    ".rv-pnote{margin:0;padding:8px 10px;border-radius:10px;background:#F4F3FF;font-size:12.5px;line-height:18px;color:#344054;white-space:pre-line}"
  ].join("\n");
  function injectCSS() {
    if (document.getElementById("rv-css")) return;
    var s = document.createElement("style"); s.id = "rv-css"; s.textContent = CSS; document.head.appendChild(s);
    if (!document.querySelector('link[href*="family=Roboto"]')) {
      var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap"; document.head.appendChild(l);
    }
  }

  /* the Mind screen's hero waits for its parent page to say go */
  addEventListener("message", function (e) { if (e.data === "hero:ready" && e.source) e.source.postMessage("hero:mount", "*"); });

  MP.steps.review = {
    title: "Review and assign",
    sub: function (plan) { var p = problems(plan, lastMode)[0]; return p ? p.msg : "Ready"; },
    render: function (el, plan, ctx) {
      ctx = ctx || {}; lastMode = ctx.mode || "plan"; injectCSS();
      var tpl = ctx.mode === "template";
      this.title = tpl ? "Review template" : "Review and assign";
      var list = ctx.readOnly ? [] : problems(plan, lastMode);
      el.innerHTML = '<div class="rv-wrap"><div class="rv-main"><div><h2 class="rv-title">' + (ctx.readOnly ? "Mind plan" : tpl ? "Review template" : "Review and assign") + '</h2>' +
        '<p class="rv-intro">' + (ctx.readOnly ? "Everything in this plan, and how it looks in the app." :
          tpl ? "Check the template before you save it. Each patient gets their own copy when you assign it." :
          "Check everything " + esc(MP.PATIENT.name) + " will get, then assign the plan.") + '</p></div>' +
        banner(list, ctx) + headerCard(plan, ctx) + rhythmCard(plan, ctx) + practicesCard(plan, ctx) +
        '</div>' + phone(plan, ctx) + '</div>';
      MP.previewPlan = plan;   /* read by mind/plan.js inside the phone (?coach=1) */
      el.onclick = function (e) {
        var b = e.target.closest("[data-go]");
        if (b && ctx.go) return ctx.go(b.getAttribute("data-go"));
        if (e.target.closest("[data-reload]")) el.querySelectorAll(".rv-app").forEach(function (f) { f.src = f.src.replace(/&t=\d+/, "&t=" + Date.now()); });
      };
    },
    valid: function (plan) { var p = problems(plan, lastMode)[0]; return p ? p.step + ": " + p.msg : null; }
  };
})();
