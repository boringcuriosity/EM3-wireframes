/* The way into the exercise plan builder (coach-exercise-template.html), in the portal's newer look (patient-detail-v2,
   as List of Diet Plans and Create Diet Plan): the patient's List of Exercise Plans, then Create Exercise Plan,
   "Start from a template" with search and pages, or a blank plan. Picking one opens Step 1 (window.CET, set by the builder).
   ?view=list (default) | pick | edit; ?step=2|3 goes straight to the builder.
   ponytail: plans and templates are samples; every template fills the 120 days Plan's routines, renamed */
(function () {
  var Q = new URLSearchParams(location.search);
  var VIEW = Q.get("step") ? "edit" : Q.get("view") || "list";
  var PER = 10;

  var BY = ["Sahana Chandra", "Rahul Mehta", "Design Test", "Priya Nair", "Arjun Rao", "Neha Kulkarni"];   /* the coach who made each template */
  var TPL = [
    ["120 days Plan", 12, 6, 7, "2025-06-23"],
    ["Diabetes, post-meal walks", 8, 6, 4, "2025-05-30"],
    ["Fatty liver, fat loss", 12, 5, 6, "2025-05-12"],
    ["PCOS strength and cardio", 10, 5, 6, "2025-04-28"],
    ["GLP-1, keep the muscle", 12, 4, 7, "2025-04-02"],
    ["Thyroid, steady energy", 8, 5, 5, "2025-03-18"],
    ["Knee OA, gentle strength", 6, 4, 5, "2025-02-20"],
    ["Low back pain care", 6, 5, 6, "2025-02-04"],
    ["Desk worker mobility", 4, 6, 5, "2025-01-15"],
    ["Beginner walking, 4 weeks", 4, 6, 2, "2024-12-09"],
    ["Home workout, no equipment", 8, 5, 6, "2024-11-21"],
    ["Breathing and posture", 4, 7, 4, "2024-11-02"],
    ["Post-COVID breathing", 6, 7, 4, "2024-10-14"],
    ["Senior balance and strength", 8, 4, 5, "2024-09-30"],
    ["Wheelchair, upper body", 8, 5, 6, "2024-09-17"],
    ["Generalized Exercise Plan", 12, 5, 6, "2024-09-17"],
    ["Yoga and stretching", 6, 6, 5, "2024-08-26"],
    ["HIIT in 20 minutes", 6, 4, 6, "2024-08-05"],
    ["Stairs and steps challenge", 4, 6, 3, "2024-07-11"],
    ["Weight loss starter", 8, 5, 6, "2024-06-19"],
    ["Prenatal gentle movement", 12, 4, 4, "2024-05-27"],
    ["28 days Plan", 4, 6, 7, "2024-03-08"],
    ["Hypertension, steady cardio", 8, 5, 5, "2023-11-22"],
    ["Others plan", 4, 5, 5, "2023-05-09"]
  ].map(function (t, i) { return { name: t[0], weeks: t[1], days: t[2], ex: t[3], at: t[4], by: BY[i % BY.length] }; });

  var PLANS = [
    { name: "Shaheer's exercise plan", status: "active", from: "2026-11-05", to: "2026-12-02" },
    { name: "Desk worker mobility", status: "draft", from: "2026-12-03", to: "2026-12-30" },
    { name: "28 days Plan", status: "inactive", from: "2026-10-08", to: "2026-11-04" }
  ];
  var LABEL = { active: "Active", draft: "Draft", inactive: "Inactive" };
  var st = { filter: "all", q: "", page: 0, pick: -1 };

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dt = function (iso) { var p = iso.split("-"); return +p[2] + " " + MON[+p[1] - 1] + " " + p[0]; };
  var IC = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    bar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    arr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
  };

  var css = document.createElement("style");
  css.textContent = [
    /* the builder hides while either of these is up */
    ".app.cs-on .ed-page,.app.cs-on .pv{display:none!important}",
    /* the builder full screen, as Create Diet Plan: no portal rail or menu, the title, steps and X in one bar, everything at 85% */
    ".app.cs-edit{grid-template-columns:0 1fr}.app.cs-edit .logo,.app.cs-edit .side{display:none}.app.cs-edit .main{grid-column:1 / -1}",
    ".app.cs-edit .ed-page{zoom:.85}.app.cs-edit .sbar{left:0}",
    ".stepper .sttl{position:absolute;left:24px;top:50%;transform:translateY(-50%);font:600 19px Onest,sans-serif;color:#299D6B}",
    ".stepper .sx{position:absolute;right:20px;top:50%;transform:translateY(-50%);width:40px;height:40px;border:0;border-radius:10px;background:none;color:#344054;cursor:pointer;display:grid;place-items:center}.stepper .sx:hover{background:#F2F4F7}.stepper .sx svg{width:22px;height:22px}",
    ".b.tx{background:none;box-shadow:none;color:#344054}.b.tx:hover{background:#F2F4F7}",
    /* leave without saving? */
    ".cs-dlg{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:rgba(16,24,40,.45);animation:csfade .18s ease}",
    ".cs-dlg>div{width:min(440px,calc(100vw - 32px));padding:22px 22px 18px;background:#fff;border-radius:18px;box-shadow:0 24px 48px rgba(16,24,40,.2);font-family:Onest,sans-serif}",
    ".cs-dlg h2{margin:0 0 6px;font:700 18px/24px Montserrat,sans-serif;color:#101828}.cs-dlg p{margin:0 0 18px;font-size:14px;line-height:21px;color:#475467}",
    ".cs-dlg .row{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}",
    "@keyframes csfade{from{opacity:0}}",
    ".cs{font-family:Onest,system-ui,sans-serif;color:#475467}",
    ".cs[hidden]{display:none!important}",
    ".cs h1{margin:0;font:800 20px/28px Montserrat,sans-serif;color:#1D4D38}",
    ".cs-sub{margin:4px 0 0;font-size:13.5px;line-height:20px;color:#475467}",
    ".csb{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;padding:0 16px;border-radius:10px;font:600 13.5px Onest,sans-serif;cursor:pointer;white-space:nowrap}",
    ".csb.pr{border:0;background:#299D6B;color:#fff}.csb.pr:hover{background:#24895e}.csb.pr:disabled{background:#D0D5DD;cursor:not-allowed}",
    ".csb.ol{border:1px solid #299D6B;background:#fff;color:#1D4D38}.csb.ol:hover{background:#F3FCF8}",
    ".csb.sm{height:32px;padding:0 12px;font-size:13px;border-radius:9px}",
    ".csb.dn{border:1px solid #F04438;background:#fff;color:#B42318}.csb.dn:hover{background:#FEF3F2}",
    ".csb.ic{width:38px;padding:0}.csb.sm.ic{width:32px}.csb svg{width:16px;height:16px}",
    /* List of Exercise Plans */
    ".cs-list{display:grid;grid-template-columns:280px minmax(0,1fr);min-height:100%;background:#F9FAFB}",
    ".cs-lh{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;height:64px;padding:0 28px;background:#fff;border-bottom:1px solid #E4E7EC}.cs-lh h1{flex:1}",
    ".cs-pn{position:sticky;top:0;height:100vh;overflow-y:auto;background:#fff;border-right:1px solid #E4E7EC;padding:16px 14px 32px}",
    ".cs-pp{display:flex;align-items:center;gap:10px;padding:2px 4px 16px;margin-bottom:8px;border-bottom:1px solid #EAECF0}",
    ".cs-pa{width:40px;height:40px;flex:none;border-radius:12px;background:#299D6B;color:#fff;display:grid;place-items:center;font:700 14px Montserrat,sans-serif}",
    ".cs-pi{flex:1;min-width:0}.cs-pi b{display:block;font:700 15px/20px Montserrat,sans-serif;color:#1D4D38}.cs-pi span{display:block;font-size:12px;line-height:17px;color:#667085}.cs-pi em{font-style:normal;font-weight:600;color:#344054}",
    ".cs-pp>svg{width:16px;height:16px;color:#667085}",
    ".cs-cap{margin:14px 10px 6px;font:700 10.5px/16px Onest,sans-serif;letter-spacing:.08em;color:#667085}",
    ".cs-ni{display:flex;align-items:center;gap:10px;min-height:34px;padding:0 10px;border-radius:9px;font:500 13.5px Onest,sans-serif;color:#101828;cursor:pointer}",
    ".cs-ni:hover{background:#F9FAFB}.cs-ni .ic{width:17px;height:17px;color:#344054}",
    ".cs-ni.sub{padding-left:30px;min-height:30px;font-size:13px;color:#344054;position:relative}.cs-ni.sub::before{content:'';position:absolute;left:16px;top:6px;width:8px;height:10px;border-left:1px solid #D0D5DD;border-bottom:1px solid #D0D5DD;border-bottom-left-radius:3px}",
    ".cs-ni.on{background:#F3FCF8;color:#1D4D38;font-weight:600}",
    ".cs-ni .dot{width:7px;height:7px;border-radius:50%;flex:none;background:#299D6B}.cs-ni .dot.ex{background:#0E9384}.cs-ni .dot.sc{background:#7A5AF8}",
    ".cs-ni .soon{margin-left:auto;padding:1px 7px;border:1px solid #E4E7EC;border-radius:999px;font:700 9.5px/15px Onest,sans-serif;letter-spacing:.06em;color:#98A2B3}",
    ".cs-coach{display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border:1px solid #EAECF0;border-radius:12px}.cs-coach .cs-pa{width:32px;height:32px;border-radius:50%;font-size:12px}.cs-coach div b{display:block;font:600 13px/17px Onest,sans-serif;color:#101828}.cs-coach div span{display:block;font-size:11.5px;color:#667085}",
    ".cs-pills{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}.cs-lc{padding:22px 28px 48px}",
    ".cs-pill{height:34px;padding:0 16px;border-radius:10px;border:1px solid #E4E7EC;background:#fff;font:600 13.5px Onest,sans-serif;color:#344054;cursor:pointer}",
    ".cs-pill[aria-pressed=true]{background:#299D6B;border-color:#299D6B;color:#fff}",
    ".cs-rows{display:flex;flex-direction:column;gap:12px}",
    ".cs-row{display:flex;align-items:center;gap:14px;padding:14px 18px;background:#fff;border:1px solid #E4E7EC;border-radius:16px}",
    ".cs-ri{width:36px;height:36px;flex:none;border-radius:10px;display:grid;place-items:center;background:#F3FCF8;color:#299D6B}.cs-ri svg{width:18px;height:18px}",
    ".cs-rm{flex:1;min-width:0}.cs-rt{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font:700 15px/22px Onest,sans-serif;color:#1D4D38}",
    ".cs-rd{margin-top:2px;font-size:12.5px;color:#667085}",
    ".cs-st{height:20px;padding:0 7px;border-radius:6px;font:600 11.5px/20px Onest,sans-serif;color:#fff}.cs-st.active{background:#299D6B}.cs-st.draft{background:#98A2B3}.cs-st.inactive{background:#D92D20}",
    ".cs-ra{display:flex;gap:10px}",
    ".cs-empty{padding:48px 24px;text-align:center;background:#fff;border:1px dashed #D0D5DD;border-radius:20px}.cs-empty b{display:block;font:700 17px Onest,sans-serif;color:#101828;margin-bottom:6px}",
    /* Create Exercise Plan: full screen, as Create Diet Plan */
    ".cs-pick{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;background:#F9FAFB}",
    ".cs-top{display:flex;align-items:center;height:56px;padding:0 24px;background:#fff;border-bottom:1px solid #E4E7EC}",
    ".cs-top b{flex:1;font:600 17px Onest,sans-serif;color:#299D6B}.cs-top button{width:40px;height:40px;border:0;background:none;color:#344054;cursor:pointer;border-radius:10px}.cs-top button:hover{background:#F2F4F7}.cs-top svg{width:22px;height:22px}",
    ".cs-body{flex:1;overflow:auto;padding:28px 24px 100px}",
    ".cs-in{max-width:1080px;margin:0 auto}",
    ".cs-ph{display:flex;align-items:flex-start;gap:24px;margin-bottom:16px}.cs-ph>div{flex:1}",
    ".cs-tools{display:flex;align-items:center;gap:16px;margin-bottom:14px}",
    ".cs-find{flex:1;max-width:360px;display:flex;align-items:center;gap:8px;height:38px;padding:0 12px;background:#fff;border:1px solid #E4E7EC;border-radius:11px}",
    ".cs-find:focus-within{border-color:#299D6B;box-shadow:0 0 0 3px rgba(41,157,107,.16)}",
    ".cs-find svg{width:18px;height:18px;flex:none;color:#667085}.cs-find input{flex:1;min-width:0;height:100%;border:0;outline:0;background:none;font:500 13.5px Onest,sans-serif;color:#101828}.cs-find input::placeholder{color:#98A2B3}",
    ".cs-count{font-size:13px;color:#667085}",
    ".cs-tbl{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #E4E7EC;border-radius:16px;overflow:hidden}",
    ".cs-tbl th{padding:12px 14px;background:#4E9C6E;color:#fff;font:600 13px Onest,sans-serif;text-align:left;white-space:nowrap}",
    ".cs-tbl td{padding:10px 14px;border-top:1px solid #EAECF0;font-size:13.5px;color:#344054;vertical-align:middle}",
    ".cs-tbl tr.on td{background:#F3FCF8}",
    ".cs-tbl td.n{font:600 14px/20px Onest,sans-serif;color:#1D4D38}",
    ".cs-tbl td.cs-n{font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".cs-tbl tbody tr{cursor:pointer}.cs-tbl tbody tr:hover td{background:#FAFCFB}.cs-tbl tbody tr.on:hover td{background:#F3FCF8}",
    ".cs-rad{width:18px;height:18px;border-radius:50%;border:2px solid #299D6B;display:grid;place-items:center}.cs-rad i{width:8px;height:8px;border-radius:50%;background:#299D6B;transform:scale(0);transition:transform .18s cubic-bezier(.2,.8,.2,1)}tr.on .cs-rad i{transform:none}",
    ".cs-none{padding:40px 16px!important;text-align:center;cursor:default}.cs-none b{display:block;font:700 16px Onest,sans-serif;color:#101828;margin-bottom:6px}",
    ".cs-link{border:0;background:none;padding:0;color:#299D6B;font:600 14.5px Onest,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}",
    /* pages */
    ".cs-pages{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px;flex-wrap:wrap}",
    ".cs-pg{display:flex;align-items:center;gap:6px}",
    ".cs-pg button{min-width:34px;height:34px;padding:0 9px;border-radius:9px;border:1px solid #E4E7EC;background:#fff;font:600 13px Onest,sans-serif;color:#344054;cursor:pointer;display:inline-flex;align-items:center;gap:4px}",
    ".cs-pg button svg{width:16px;height:16px}.cs-pg button[aria-current=page]{background:#299D6B;border-color:#299D6B;color:#fff}.cs-pg button:disabled{opacity:.4;cursor:not-allowed}",
    ".cs-foot{position:fixed;left:0;right:0;bottom:0;z-index:61;display:flex;align-items:center;gap:12px;padding:12px 24px;background:#fff;border-top:1px solid #E4E7EC}",
    ".cs-foot span{flex:1;font-size:13.5px;color:#475467}.cs-foot b{color:#1D4D38}"
  ].join("");
  document.head.appendChild(css);
  if (!document.querySelector('link[href*="Montserrat"]')) {
    var l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Onest:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }

  var app, main, list, pick;
  function show(v) {
    VIEW = v;
    app.classList.toggle("cs-on", v !== "edit"); app.classList.toggle("cs-edit", v === "edit");
    list.hidden = v !== "list"; pick.hidden = v !== "pick";
    if (v === "list") drawList();
    if (v === "pick") { drawPick(); setTimeout(function () { var f = document.getElementById("csq"); if (f) f.focus(); }, 50); }
    if (v === "edit") main.scrollTop = 0;
  }

  /* ---------- the patient's side panel, as patient-detail-v2 (sticky, its own scroll) ---------- */
  function pnav() {
    var ic = function (n) { return '<i class="ic" style="--ic:url(/v7/img/coach/icons/' + n + '.svg)"></i>'; };
    var it = function (label, icon, extra) { return '<div class="cs-ni">' + (icon ? ic(icon) : "") + label + (extra || "") + "</div>"; };
    var sub = function (label, on) { return '<div class="cs-ni sub' + (on ? ' on" aria-current="page' : "") + '">' + label + "</div>"; };
    var soon = '<span class="soon">SOON</span>';
    return '<nav class="cs-pn" aria-label="Patient">' +
      '<div class="cs-pp"><span class="cs-pa">JD</span><div class="cs-pi"><b>Jhon Doe</b><span>60 · Male</span><span>Indication: <em>Others</em></span></div>' + IC.chevR + "</div>" +
      it("Overview", "layers-outline") + it("Chat with Kaira", "chatbubbles-outline") +
      '<div class="cs-cap">PATIENT RECORD</div>' +
      it("Shared Profile", "person-outline") + it("Records", "document-text-outline") + it("Lab Vitals", "medkit-outline") +
      it("BCA Report", "accessibility-outline", soon) + it("CGM Report", "time-outline", soon) + it("Consultations", "calendar-outline") +
      it("Progress & Goals", "clipboard-outline") + sub("Main Goals") + sub("Custom Goals") + sub("Assessment Recap") +
      it("Other Trackers", "footsteps-outline") + sub("Incentive Spirometer") + sub("Steps") + sub("Water Intake") + sub("Sleep") +
      '<div class="cs-cap">CARE TRIAD</div>' +
      it('<span class="dot"></span>Diet Coach') +
      it('<span class="dot ex"></span>Exercise Coach') + sub("Baseline Assessment") + sub("Follow-up Assessments") + sub("List of Exercise Plans", true) +
      it('<span class="dot sc"></span>Success Coach') + "</nav>";
  }

  /* ---------- List of Exercise Plans ---------- */
  function drawList() {
    var rows = PLANS.filter(function (p) { return st.filter === "all" || p.status === st.filter; });
    list.innerHTML = pnav() + '<div><div class="cs-lh"><h1>List of Exercise Plans</h1>' +
      '<button class="csb ol ic" data-cs="refresh" aria-label="Refresh">' + IC.redo + '</button>' +
      '<button class="csb pr" data-cs="create">+ Create Exercise Plan</button>' +
      '<div class="cs-coach"><span class="cs-pa">DT</span><div><b>Design Test</b><span>Exercise Coach</span></div></div></div><div class="cs-lc">' +
      '<div class="cs-pills" role="group" aria-label="Filter plans">' + [["all", "All"], ["active", "Active"], ["draft", "Drafts"], ["inactive", "Inactive"]].map(function (f) {
        return '<button class="cs-pill" data-csf="' + f[0] + '" aria-pressed="' + (st.filter === f[0]) + '">' + f[1] + "</button>";
      }).join("") + "</div>" +
      (rows.length ? '<div class="cs-rows">' + rows.map(function (p) {
        var i = PLANS.indexOf(p);
        return '<article class="cs-row"><span class="cs-ri">' + IC.bar + '</span><div class="cs-rm"><div class="cs-rt">' + esc(p.name) +
          '<span class="cs-st ' + p.status + '">' + LABEL[p.status] + '</span></div><div class="cs-rd">' + dt(p.from) + " - " + dt(p.to) + "</div></div>" +
          '<div class="cs-ra">' + (p.status === "draft" ? '<button class="csb ol sm" data-csopen="' + i + '">Continue editing ' + IC.arr + "</button>" : '<button class="csb ol sm" data-csopen="' + i + '">View plan ' + IC.arr + "</button>") +
          (p.status === "active" ? '<button class="csb dn sm" data-csoff="' + i + '">Deactivate</button>' : "") +
          '<button class="csb ol sm ic" data-cscopy="' + i + '" aria-label="Copy ' + esc(p.name) + ' into a new plan" title="Copy into a new plan">' + IC.copy + "</button></div></article>";
      }).join("") + "</div>"
        : '<div class="cs-empty"><b>No ' + (st.filter === "draft" ? "drafts" : st.filter + " plans") + '</b>Plans you create for this patient show here.</div>') + "</div></div>";
  }

  /* ---------- Create Exercise Plan: start from a template ---------- */
  function found() {
    var w = st.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return TPL.filter(function (t) { var n = (t.name + " " + t.by).toLowerCase(); return w.every(function (x) { return n.indexOf(x) >= 0; }); });   /* by template or by the coach who made it */
  }
  function drawPick() {
    var all = found(), pages = Math.max(1, Math.ceil(all.length / PER));
    if (st.page >= pages) st.page = pages - 1;
    var from = st.page * PER, rows = all.slice(from, from + PER), sel = TPL[st.pick];
    pick.innerHTML = '<div class="cs-top"><b>Create Exercise Plan</b><button data-cs="close" aria-label="Close">' + IC.x + "</button></div>" +
      '<div class="cs-body"><div class="cs-in">' +
      '<div class="cs-ph"><div><h1>Start from a template</h1><p class="cs-sub">Its routines fill each day of the plan, with small moves and steps set after. You can change anything before you assign it.</p></div>' +
      '<button class="csb ol" data-cs="blank">Start a blank plan</button></div>' +
      '<div class="cs-tools"><label class="cs-find">' + IC.search + '<input id="csq" type="search" placeholder="Search by template or coach" aria-label="Search templates" autocomplete="off" value="' + esc(st.q) + '"></label>' +
      '<span class="cs-count" aria-live="polite">' + (st.q.trim() ? all.length + (all.length === 1 ? " template" : " templates") + " found" : TPL.length + " templates") + "</span></div>" +
      '<table class="cs-tbl"><thead><tr><th style="width:56px"></th><th>Template</th><th>Length</th><th>Created by</th><th>Created on</th><th style="width:170px"></th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (t) {
        var i = TPL.indexOf(t);
        return '<tr class="' + (i === st.pick ? "on" : "") + '" data-csrow="' + i + '"><td><span class="cs-rad" role="radio" aria-checked="' + (i === st.pick) + '" aria-label="' + esc(t.name) + '"><i></i></span></td>' +
          '<td class="n">' + esc(t.name) + '</td><td class="cs-n">' + t.weeks + " weeks</td><td>" + esc(t.by) + '</td><td class="cs-n">' + dt(t.at) + "</td>" +
          '<td><button class="csb ol sm" data-csuse="' + i + '">Use template</button></td></tr>';
      }).join("")
        : '<tr><td class="cs-none" colspan="6"><b>No templates match “' + esc(st.q.trim()) + '”</b>Try a shorter word, or <button class="cs-link" data-cs="clear">clear the search</button>.</td></tr>') +
      "</tbody></table>" +
      (all.length > PER ? '<div class="cs-pages"><span class="cs-count">Showing ' + (from + 1) + "–" + (from + rows.length) + " of " + all.length + "</span>" +
        '<nav class="cs-pg" aria-label="Pages"><button data-cspg="' + (st.page - 1) + '"' + (st.page ? "" : " disabled") + ">" + IC.chevL + "Previous</button>" +
        Array.from({ length: pages }, function (_, k) { return '<button data-cspg="' + k + '"' + (k === st.page ? ' aria-current="page"' : "") + ' aria-label="Page ' + (k + 1) + '">' + (k + 1) + "</button>"; }).join("") +
        '<button data-cspg="' + (st.page + 1) + '"' + (st.page < pages - 1 ? "" : " disabled") + ">Next" + IC.chevR + "</button></nav></div>" : "") +
      "</div></div>" +
      '<div class="cs-foot"><span>' + (sel ? "Selected: <b>" + esc(sel.name) + "</b>, " + sel.weeks + " weeks" : "Pick a template, or start a blank plan") + "</span>" +
      '<button class="csb ol" data-cs="close">Cancel</button><button class="csb pr" data-cs="next"' + (sel ? "" : " disabled") + ">Next</button></div>";
  }

  /* Save as Draft: the plan joins the list as a draft, under its name (or Untitled plan) */
  function planName() { var f = document.getElementById("pname"); return (f && f.value.trim()) || "Untitled plan"; }
  function saveDraft() {
    var n = planName(), t = new Date(), iso = function (d) { return d.toISOString().slice(0, 10); }, end = new Date(t.getTime() + 27 * 864e5);
    var had = PLANS.filter(function (p) { return p.name === n && p.status === "draft"; })[0];
    if (had) { had.from = iso(t); had.to = iso(end); } else PLANS.unshift({ name: n, status: "draft", from: iso(t), to: iso(end) });
    st.filter = "all"; show("list");
    var tt = document.getElementById("toast"); if (tt) { tt.textContent = "Saved as a draft. Find it under Drafts when you are ready to finish."; tt.classList.add("on"); setTimeout(function () { tt.classList.remove("on"); }, 3000); }
  }
  /* the X: nothing is lost by accident */
  function leave() {
    var d = document.createElement("div"); d.className = "cs-dlg"; d.id = "csdlg";
    d.innerHTML = '<div role="alertdialog" aria-modal="true" aria-labelledby="csdlgT"><h2 id="csdlgT">Leave this plan?</h2>' +
      "<p>Your changes are not saved yet. Save it as a draft to finish later, or leave without saving.</p>" +
      '<div class="row"><button class="csb tx" data-csleave="stay" style="border:0;background:none;color:#344054">Keep Editing</button>' +
      '<button class="csb dn" data-csleave="go">Leave Without Saving</button><button class="csb pr" data-csleave="draft">Save as Draft</button></div></div>';
    document.body.appendChild(d); d.querySelector('[data-csleave="draft"]').focus();
  }

  function useTpl(i) { show("edit"); window.CET && window.CET.use(TPL[i].name); }

  document.addEventListener("DOMContentLoaded", function () {
    app = document.getElementById("app"); main = document.getElementById("main");
    list = document.createElement("div"); list.className = "cs cs-list"; main.insertBefore(list, main.firstChild);
    pick = document.createElement("div"); pick.className = "cs cs-pick"; pick.setAttribute("role", "dialog"); pick.setAttribute("aria-modal", "true"); pick.setAttribute("aria-label", "Create Exercise Plan");
    document.body.appendChild(pick);
    /* the builder's own Cancel (and the preview's) come back to the list */
    document.addEventListener("click", function (e) {
      var t = e.target, a;
      if ((a = t.closest("[data-csf]"))) { st.filter = a.dataset.csf; return drawList(); }
      if ((a = t.closest("[data-csopen]"))) { var p = PLANS[+a.dataset.csopen]; show("edit"); return window.CET && window.CET.use(p.name); }
      if ((a = t.closest("[data-csoff]"))) { PLANS[+a.dataset.csoff].status = "inactive"; return drawList(); }
      if ((a = t.closest("[data-cscopy]"))) { show("edit"); return window.CET && window.CET.use(PLANS[+a.dataset.cscopy].name + " (copy)"); }
      if ((a = t.closest("[data-cspg]"))) { st.page = +a.dataset.cspg; drawPick(); pick.querySelector(".cs-body").scrollTop = 0; return; }
      if ((a = t.closest("[data-csuse]"))) { e.stopPropagation(); return useTpl(+a.dataset.csuse); }
      if ((a = t.closest("[data-csrow]"))) { st.pick = +a.dataset.csrow; return drawPick(); }
      if (t.closest('.sbar [data-x="draft"]')) return saveDraft();
      if (t.closest('.stepper [data-x="close"]')) return leave();
      if ((a = t.closest("[data-csleave]"))) {
        var how = a.dataset.csleave; document.getElementById("csdlg").remove();
        if (how === "draft") return saveDraft();
        if (how === "go") return show("list");
        return;
      }
      if ((a = t.closest("[data-cs]"))) {
        var x = a.dataset.cs;
        if (x === "create") { st.q = ""; st.page = 0; st.pick = -1; return show("pick"); }
        if (x === "close") return show("list");
        if (x === "blank") { show("edit"); return window.CET && window.CET.blank(); }
        if (x === "next" && st.pick >= 0) return useTpl(st.pick);
        if (x === "clear") { st.q = ""; st.page = 0; drawPick(); return document.getElementById("csq").focus(); }
        if (x === "refresh") return drawList();
      }
    });
    document.addEventListener("input", function (e) {
      if (e.target.id !== "csq") return;
      st.q = e.target.value; st.page = 0;
      var pos = e.target.selectionStart; drawPick();
      var f = document.getElementById("csq"); f.focus(); f.setSelectionRange(pos, pos);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var d = document.getElementById("csdlg"); if (d) return d.remove();
      if (VIEW === "pick") show("list");
    });
    show(VIEW);
  });
})();
