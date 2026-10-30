/* Mind plan host (coach-mind-plan.html): portal shell, Mind Plans list, the full-screen create flow and the template library.
   The four steps are modules (MP.steps.sleep, selfcare, practices, review), loaded here from rhythm.js, practices.js, review.js.
   Until a module exists, its step shows a calm placeholder. State lives in memory only, so a reload starts fresh.
   Deep links: ?view=list|create|library &step=sleep|selfcare|practices|review &t=<template id> &demo=1 (seeds three sample plans). */
(function () {
  var MP = window.MP, H = MP.helpers, esc = H.esc, clone = MP.clone;
  var KEYS = ["sleep", "selfcare", "practices", "review"];
  var FALLBACK = {
    sleep: { title: "Sleep", sub: "70 points", lead: "Hours of sleep, the sleep window and wind-down tasks." },
    selfcare: { title: "Self-care", sub: "30 points", lead: "Breathing, me-time and the evening mood check-in." },
    practices: { title: "Coach's practices", sub: "Not scored", lead: "The worksheets and trackers you pick for Patient A." },
    review: { title: "Review and assign", sub: "Check and assign", lead: "Everything in the plan, in one place." }
  };
  var NEXT_LABEL = { sleep: "Next: Self-care", selfcare: "Next: Coach's Practices", practices: "Next: Review" };
  var Q = new URLSearchParams(location.search);
  var root = document.getElementById("mp-root");

  var S = {
    plans: clone(MP.PLANS || []),
    templates: MP.TEMPLATES.map(function (t) { var c = clone(t); c.own = false; return c; }),
    filter: "all", view: "list", flow: null, libFrom: "list", fresh: null, seq: 1
  };

  /* ---------- small helpers ---------- */
  var IC = {
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>',
    chev: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
  };
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  function t12(hm) { try { return H.t12(hm); } catch (e) { return hm || ""; } }
  function window12(p) { var r = p.rhythm || {}; return r.bedtime && r.wake ? t12(r.bedtime) + " to " + t12(r.wake) : "Not set"; }
  function summary(p) {
    var r = p.rhythm || {};
    return ["Bed " + window12(p), (r.winddown || []).length + " wind-down", (r.breathing || []).length + " breathing",
      (r.metime || []).length + " me-time", plural((p.practices || []).length, "practice")].join(", ");
  }
  function dates(p) { return p.start && p.end ? H.date(p.start) + " to " + H.date(p.end) : ""; }
  function snap(p) { return JSON.stringify(p); }
  function mod(k) { return MP.steps && MP.steps[k]; }
  function stitle(k) { var m = mod(k); return (m && m.title) || FALLBACK[k].title; }
  function ssub(k, p) { var m = mod(k); if (!m || !m.sub) return FALLBACK[k].sub; try { return m.sub(p) || ""; } catch (e) { return FALLBACK[k].sub; } }
  function svalid(k, p) { var m = mod(k); if (!m || !m.valid) return null; try { return m.valid(p) || null; } catch (e) { return null; } }
  function tplById(id) { return S.templates.filter(function (t) { return t.id === id; })[0]; }
  function newId(pre) { return pre + "-" + Date.now().toString(36) + "-" + (S.seq++); }
  function patient() { return MP.PATIENT.name; }

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("mp-toast"), toastT;
  function toast(msg, action, fn) {
    clearTimeout(toastT);
    toastEl.innerHTML = "<span>" + esc(msg) + "</span>" + (action ? '<button type="button">' + esc(action) + "</button>" : "");
    if (action) toastEl.querySelector("button").onclick = function () { hideToast(); fn(); };
    toastEl.classList.add("is-on");
    toastT = setTimeout(hideToast, action ? 6000 : 3200);
  }
  function hideToast() { toastEl.classList.remove("is-on"); }

  /* ---------- in-page dialog (never window.confirm). Escape and the X cancel. ---------- */
  var dlgOpen = null;
  function dialog(o) {
    var back = document.activeElement;
    var scrim = document.createElement("div");
    scrim.className = "mp-scrim";
    scrim.innerHTML = '<div class="mp-dlg" role="dialog" aria-modal="true" aria-labelledby="mp-dlg-t">' +
      '<div class="mp-dlg-h"><h2 id="mp-dlg-t">' + esc(o.title) + '</h2><button type="button" class="mp-x" data-x aria-label="Close">' + IC.x + "</button></div>" +
      (o.body || "") + '<div class="mp-dlg-a"></div></div>';
    var acts = scrim.querySelector(".mp-dlg-a");
    function close() { if (!scrim.parentNode) return; scrim.remove(); dlgOpen = null; document.removeEventListener("keydown", key, true); if (back && back.focus) back.focus(); }
    (o.actions || []).forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "mp-btn " + (a.cls || "") + (a.left ? " mp-dlg-left" : ""); b.textContent = a.label;
      b.onclick = function () { if (a.fn && a.fn(scrim) === false) return; close(); };
      acts.appendChild(b);
    });
    function key(e) {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); if (o.onCancel) o.onCancel(); }
      if (e.key === "Tab") {
        var f = [].slice.call(scrim.querySelectorAll("button, input, textarea"));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    }
    scrim.querySelector("[data-x]").onclick = function () { close(); if (o.onCancel) o.onCancel(); };
    scrim.addEventListener("mousedown", function (e) { if (e.target === scrim) { close(); if (o.onCancel) o.onCancel(); } });
    document.addEventListener("keydown", key, true);
    document.body.appendChild(scrim);
    dlgOpen = close;
    var first = scrim.querySelector("input") || scrim.querySelector(".mp-dlg-a .is-primary") || acts.lastChild;
    if (first) first.focus();
    return close;
  }

  /* ---------- the portal shell and the Mind Plans list ---------- */
  function nav() {
    var P = MP.PATIENT;
    var item = function (label, cls, extra) { return '<li><div class="mp-ni ' + (cls || "") + '">' + label + (extra || "") + "</div></li>"; };
    return '<nav class="mp-nav" aria-label="Patient">' +
      '<div class="mp-pt"><span class="mp-pt-av">' + esc(P.name.charAt(0)) + '</span><div><div class="mp-pt-name">' + esc(P.name) + '</div>' +
      '<div class="mp-pt-meta">' + P.age + " · " + esc(P.sex) + " · Indication: <b>" + esc(P.indication) + "</b></div></div></div>" +
      "<ul>" + item("Overview") + item("Chat with KAIRA") + "</ul>" +
      '<div class="mp-nav-cap">CARE TRIAD</div><ul>' +
      item('<span class="mp-dot"></span>Diet Coach') + item('<span class="mp-dot"></span>Exercise Coach') +
      item('<span class="mp-dot is-sc"></span>Success Coach', "is-open", '<span class="mp-ni-chev">' + IC.chev + "</span>") +
      item("Baseline Assessment", "is-sub") + item("Follow-up Assessments", "is-sub") +
      '<li><button type="button" class="mp-ni is-sub is-on" aria-current="page" data-act="home">Mind Plan<span class="mp-new">New</span></button></li>' +
      "</ul></nav>";
  }
  function coachChip() {
    var C = MP.COACH;
    return '<div class="mp-coach"><span class="mp-coach-av">' + esc(C.initials) + '</span><div><div class="mp-coach-n">' + esc(C.name) + '</div><div class="mp-coach-r">' + esc(C.role) + "</div></div></div>";
  }
  function counts() {
    var c = { all: S.plans.length, active: 0, draft: 0, inactive: 0 };
    S.plans.forEach(function (p) { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }
  function ring() {
    /* the Rhythm score's six parts at their real weights: three sleep parts in indigo, then breathing, me-time and mood */
    var R = 46, C = 2 * Math.PI * R, at = 0, gap = 2.4;
    var col = { hours: "#444CE7", window: "#6172F3", winddown: "#8098F9", breathing: "#0E9384", metime: "#DC6803", mood: "#DD2590" };
    var arcs = MP.PARTS.map(function (p) {
      var len = p.w / 100 * C, s = '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + col[p.key] + '" stroke-width="12" stroke-dasharray="' + (len - gap).toFixed(2) + " " + (C - len + gap).toFixed(2) + '" stroke-dashoffset="' + (-at).toFixed(2) + '" transform="rotate(-90 60 60)"/>';
      at += len; return s;
    }).join("");
    return '<svg class="mp-ring" width="136" height="136" viewBox="0 0 120 120" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="58" fill="none" stroke="#BDB4FE" stroke-width="1.5" stroke-dasharray="2 4"/>' + arcs +
      '<text x="60" y="60" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="22" fill="#1D4D38">100</text>' +
      '<text x="60" y="76" text-anchor="middle" font-family="Onest" font-weight="600" font-size="9.5" fill="#667085">Rhythm score</text></svg>';
  }
  function emptyState() {
    return '<section class="mp-empty" aria-labelledby="mp-empty-t">' + ring() +
      '<h2 id="mp-empty-t">No Mind plan yet</h2>' +
      "<p>A Mind plan sets the Rhythm score from sleep and self-care, out of 100.</p>" +
      "<p>Add your own practices beside it for " + esc(patient()) + " to fill in.</p>" +
      '<div class="mp-keys"><span class="mp-key is-sleep"><i></i>Sleep, 70 points</span><span class="mp-key is-care"><i></i>Self-care, 30 points</span><span class="mp-key is-pr"><i></i>Your practices</span></div>' +
      '<button type="button" class="mp-btn is-primary" data-act="create">' + IC.plus + "Create Mind Plan</button>" +
      '<div class="mp-empty-sub"><button type="button" class="mp-link" data-act="library">Browse templates</button></div></section>';
  }
  var NONE = {
    active: "No active plan. Assign a draft or create a new plan.",
    draft: "No drafts. Save as Draft keeps a plan here until you assign it.",
    inactive: "No inactive plans. When you assign a new plan, the one before it moves here."
  };
  var ORDER = { active: 0, draft: 1, inactive: 2 };
  var LABEL = { active: "Active", draft: "Draft", inactive: "Inactive" };
  function listBody() {
    if (!S.plans.length) return emptyState();
    var c = counts();
    var pills = [["all", "All"], ["active", "Active"], ["draft", "Drafts"], ["inactive", "Inactive"]].map(function (f) {
      return '<button type="button" class="mp-pill" data-filter="' + f[0] + '" aria-pressed="' + (S.filter === f[0]) + '">' + f[1] + '<span class="mp-n">' + c[f[0]] + "</span></button>";
    }).join("");
    var rows = S.plans.filter(function (p) { return S.filter === "all" || p.status === S.filter; })
      .sort(function (a, b) { return (ORDER[a.status] - ORDER[b.status]) || (b.saved || 0) - (a.saved || 0); })
      .map(function (p) {
        return '<article class="mp-row' + (S.fresh === p.id ? " is-fresh" : "") + '" data-id="' + esc(p.id) + '">' +
          '<span class="mp-row-ic">' + IC.moon + "</span>" +
          '<div class="mp-row-main"><div class="mp-row-t"><span class="mp-row-n">' + esc(p.name) + '</span><span class="mp-st is-' + p.status + '">' + LABEL[p.status] + "</span></div>" +
          '<div class="mp-row-m">' + esc(dates(p)) + ". " + esc(summary(p)) + "</div></div>" +
          '<div class="mp-row-a">' + (p.status === "draft" ? '<button type="button" class="mp-btn is-sm" data-act="edit" data-id="' + esc(p.id) + '" aria-label="Edit ' + esc(p.name) + '">Edit</button>' : "") +
          '<button type="button" class="mp-btn is-sm" data-act="view" data-id="' + esc(p.id) + '" aria-label="View ' + esc(p.name) + '">' + IC.eye + "View</button></div></article>";
      }).join("");
    return '<div class="mp-pills" role="group" aria-label="Filter plans">' + pills + "</div>" +
      '<div class="mp-rows">' + (rows || '<div class="mp-none">' + NONE[S.filter] + "</div>") + "</div>";
  }
  function renderShell() {
    var has = S.plans.length > 0;
    root.innerHTML = '<div class="mp-shell">' + nav() + '<div class="mp-page">' +
      '<header class="mp-top"><h1>Mind Plans</h1><span class="mp-top-sp"></span>' +
      '<button type="button" class="mp-btn" data-act="library">' + IC.grid + "Templates</button>" +
      (has ? '<button type="button" class="mp-btn is-primary" data-act="create">' + IC.plus + "Create Mind Plan</button>" : "") +
      coachChip() + "</header>" +
      '<main class="mp-body">' + listBody() + "</main></div></div>";
  }
  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act], [data-filter]");
    if (!b) return;
    if (b.dataset.filter) { S.filter = b.dataset.filter; renderShell(); root.querySelector('[data-filter="' + S.filter + '"]').focus(); return; }
    var a = b.dataset.act, p = S.plans.filter(function (x) { return x.id === b.dataset.id; })[0];
    if (a === "create") openStart();
    if (a === "library") openLibrary("list");
    if (a === "home") { S.filter = "all"; renderShell(); }
    if (a === "view" && p) openView(p);
    if (a === "edit" && p) editDraft(p);
  });

  /* ---------- the full-screen frame ---------- */
  var full = null;
  function frame() {
    if (!full) {
      full = document.createElement("div");
      full.className = "mp-full";
      full.setAttribute("role", "region");
      document.body.appendChild(full);
    }
    return full;
  }
  function closeFrame() { if (full) { full.remove(); full = null; } S.flow = null; S.view = "list"; renderShell(); sync(); }
  function bar(title, middle, end) {
    return '<header class="mp-fbar"><div class="mp-ftitle"><span>' + title + "</span></div><div>" + (middle || "") + '</div><div class="mp-fend">' + (end || "") +
      '<button type="button" class="mp-x" data-f="close" aria-label="Close">' + IC.x + "</button></div></header>";
  }

  /* Start screen: templates table and the blank plan */
  function openStart() {
    S.view = "create"; S.flow = { kind: "start", mode: "plan" };
    var f = frame(); f.setAttribute("aria-label", "Create Mind Plan");
    var rows = S.templates.map(function (t) {
      return "<tr><td><span class=\"mp-tn\">" + esc(t.name) + "</span>" + (t.own ? '<span class="mp-tag">Yours</span>' : "") + '</td><td class="mp-ta">' + esc(t.about || "") + "</td>" +
        '<td class="mp-nowrap">' + esc(window12(t)) + '</td><td class="mp-nowrap">' + (t.practices.length ? plural(t.practices.length, "practice") : "None") + "</td>" +
        '<td class="mp-tact"><button type="button" class="mp-btn is-sm" data-f="use" data-id="' + esc(t.id) + '" aria-label="Use template ' + esc(t.name) + '">Use Template</button></td></tr>';
    }).join("");
    f.innerHTML = bar("Create Mind Plan") + '<div class="mp-fscroll"><main class="mp-fmain mp-step-el">' +
      '<div class="mp-head"><div><h2>Start from a template</h2><p>Its sleep, self-care and practices fill the plan. You can change anything before you assign it.</p></div></div>' +
      '<table class="mp-table"><thead><tr><th scope="col">Template</th><th scope="col">About</th><th scope="col">Sleep window</th><th scope="col">Practices</th><th scope="col"><span class="mp-sr">Action</span></th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<section class="mp-blank"><div><h3>Start a blank plan</h3><p>Every part starts empty, and you choose each one yourself. The score weights stay the same.</p></div>' +
      '<button type="button" class="mp-btn" data-f="blank">Start a Blank Plan</button></section>' +
      '<p class="mp-foot">Change a starting point for future plans in <button type="button" class="mp-link" data-f="manage">Manage Templates</button></p>' +
      "</main></div>";
    sync();
    var first = f.querySelector('[data-f="use"]'); if (first) first.focus();
  }

  /* Steps: plan mode or template mode */
  function startFlow(plan, o) {
    S.view = o.mode === "template" ? "library" : "create";
    S.flow = { kind: "steps", mode: o.mode, plan: plan, step: null, seen: {}, base: snap(plan), editId: o.editId || null, tId: o.tId || null, isEdit: !!o.isEdit, msg: null };
    var f = frame(); f.innerHTML = "";
    f.setAttribute("aria-label", flowTitle());
    if (o.seenAll) KEYS.forEach(function (k) { S.flow.seen[k] = true; });
    goStep(o.step || "sleep", true);
  }
  function fromTemplate(t) {
    var p = clone(t); delete p.own; delete p.about;
    var b = MP.blankPlan(); p.id = null; p.status = "draft"; p.from = t.id; p.start = b.start; p.end = b.end; p.name = "Mind Plan";
    return p;
  }
  function flowTitle() {
    var F = S.flow;
    if (F.mode === "template") return F.isEdit ? "Edit Template" : "New Template";
    return F.isEdit ? "Edit Mind Plan" : "Create Mind Plan";
  }
  function dirty() { return S.flow && S.flow.plan && snap(S.flow.plan) !== S.flow.base; }

  function stepper() {
    var F = S.flow;
    return '<ol class="mp-steps" aria-label="Steps">' + KEYS.map(function (k, i) {
      var on = F.step === k, seen = !!F.seen[k];
      return (i ? '<li class="mp-sline" aria-hidden="true"></li>' : "") + '<li><button type="button" class="mp-sbtn' + (on ? " is-on" : seen ? " is-seen" : "") + '" data-f="step" data-k="' + k + '"' +
        (on ? ' aria-current="step"' : "") + (seen ? "" : " disabled") + '><span class="mp-snum">' + (i + 1) + '</span><span class="mp-stxt"><span class="mp-stitle">' + esc(stitle(k)) +
        '</span><span class="mp-ssub" data-sub="' + k + '">' + esc(ssub(k, F.plan)) + "</span></span></button></li>";
    }).join("") + "</ol>";
  }
  function bottom() {
    var F = S.flow, i = KEYS.indexOf(F.step), last = F.step === "review";
    var primary = last ? (F.mode === "template" ? "Save Template" : "Assign to " + patient()) : NEXT_LABEL[F.step];
    return '<footer class="mp-fbot"><div class="mp-msg" data-msg role="alert" hidden></div>' +
      '<div class="mp-sum"><i aria-hidden="true"></i><span data-sum>' + esc(summary(F.plan)) + "</span></div>" +
      '<div class="mp-acts">' + (i > 0 ? '<button type="button" class="mp-btn is-ghost" data-f="back">Back</button>' : "") +
      (F.mode === "plan" ? '<button type="button" class="mp-btn" data-f="draft">Save as Draft</button>' : "") +
      '<button type="button" class="mp-btn is-primary" data-f="' + (last ? "finish" : "next") + '">' + esc(primary) + "</button></div></footer>";
  }
  function placeholder(el, k) {
    el.innerHTML = '<section class="mp-ph"><div class="mp-ph-ic">' + IC.moon + "</div><h2>" + esc(stitle(k)) + "</h2><p>" + esc(FALLBACK[k].lead) +
      " This step is still being built, so you can move on and come back to it.</p>" +
      (k === "review" ? '<p style="margin-top:14px;font-weight:600;color:#1D4D38">' + esc(summary(S.flow.plan)) + "</p>" : "") + "</section>";
  }
  function renderModule(el, k, plan, ctx) {
    var m = mod(k);
    if (!m || !m.render) { placeholder(el, k); return; }
    try { m.render(el, plan, ctx); }
    catch (e) { console.warn("Mind plan step " + k + " could not render", e); placeholder(el, k); }
  }
  function goStep(k, first) {
    var F = S.flow; if (!F || KEYS.indexOf(k) < 0) return;
    F.step = k; F.seen[k] = true;
    var f = frame();
    f.innerHTML = bar(esc(flowTitle()), stepper()) + '<div class="mp-fscroll"><main class="mp-fmain"><div class="mp-step-el" data-el></div></main></div>' + bottom();
    var el = f.querySelector("[data-el]");
    renderModule(el, k, F.plan, { mode: F.mode, go: function (key) { goStep(key); }, readOnly: false });
    refresh();
    sync();
    if (!first) { var on = f.querySelector(".mp-sbtn.is-on"); if (on) on.focus({ preventScroll: true }); }
  }
  /* modules call MP.changed() after every change: refresh only the host's live bits */
  function refresh() {
    var F = S.flow; if (!F || !F.plan || !full) return;
    KEYS.forEach(function (k) { var s = full.querySelector('[data-sub="' + k + '"]'); if (s) { s.textContent = ssub(k, F.plan); s.title = s.textContent; } });
    var sum = full.querySelector("[data-sum]"); if (sum) sum.textContent = summary(F.plan);
    var m = full.querySelector("[data-msg]");
    if (m && !m.hidden && F.kind === "steps" && !svalid(F.step, F.plan)) m.hidden = true;
  }
  MP.changed = refresh;
  function showMsg(text) {
    var m = full && full.querySelector("[data-msg]"); if (!m) return;
    m.innerHTML = IC.warn + "<span>" + esc(text) + "</span>"; m.hidden = false;
  }
  function firstProblem() {
    var F = S.flow;
    for (var i = 0; i < KEYS.length; i++) { var v = svalid(KEYS[i], F.plan); if (v) return { k: KEYS[i], v: v }; }
    return null;
  }

  function next() {
    var F = S.flow, v = svalid(F.step, F.plan);
    if (v) {   /* a step that can point at the field itself does; otherwise the message above the bar */
      var m = mod(F.step), body = full.querySelector(".mp-fscroll");
      try { if (m && m.flag && m.flag(F.plan, body)) return; } catch (e) {}
      showMsg(v); return;
    }
    goStep(KEYS[KEYS.indexOf(F.step) + 1]);
    var sc = full.querySelector(".mp-fscroll"); if (sc) sc.scrollTop = 0;
  }
  function upsertPlan(p) {
    var i = -1; S.plans.forEach(function (x, j) { if (x.id === p.id) i = j; });
    if (i < 0) S.plans.push(p); else S.plans[i] = p;
  }
  function saveDraft() {
    var F = S.flow, p = clone(F.plan);
    p.id = F.editId || newId("mp"); p.status = "draft"; p.saved = Date.now();
    if (!String(p.name || "").trim()) p.name = "Mind Plan";
    upsertPlan(p);
    S.fresh = p.id; S.filter = "all";
    closeFrame();
    toast("Draft saved. Find it under Drafts when you are ready to finish.");
    fadeFresh();
  }
  function assign() {
    var F = S.flow, bad = firstProblem();
    if (bad) { goStep(bad.k); showMsg(bad.v); return; }
    var p = clone(F.plan), replaced = [];
    p.id = F.editId || newId("mp"); p.status = "active"; p.saved = Date.now();
    if (!String(p.name || "").trim()) p.name = "Mind Plan";
    S.plans.forEach(function (x) { if (x.status === "active" && x.id !== p.id) { x.status = "inactive"; replaced.push(x.name); } });
    upsertPlan(p);
    S.fresh = p.id; S.filter = "all";
    S.flow = { kind: "done", mode: "plan" };
    var f = frame();
    f.innerHTML = bar("Create Mind Plan") + '<div class="mp-done" role="status"><div class="mp-done-in">' +
      '<svg width="84" height="84" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="32" fill="#E6FAF1"/><circle class="mp-done-c" cx="36" cy="36" r="32" fill="none" stroke="#299D6B" stroke-width="3" transform="rotate(-90 36 36)"/>' +
      '<path class="mp-done-k" d="M24 37l8 8 16-17" fill="none" stroke="#299D6B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "<h2>Assigned to " + esc(patient()) + "</h2>" +
      "<p>" + esc(p.name) + " starts on " + esc(H.date(p.start)) + ". " + esc(patient()) + " sees it in the app from that day.</p>" +
      (replaced.length ? "<p>" + esc(replaced.join(", ")) + (replaced.length === 1 ? " is" : " are") + " now inactive.</p>" : "") +
      '<button type="button" class="mp-btn is-primary" data-f="close">Back to Mind Plans</button></div></div>';
    f.querySelector(".mp-done .mp-btn").focus();
    var mine = S.flow;
    setTimeout(function () { if (S.flow === mine) { closeFrame(); fadeFresh(); } }, 3200);
  }
  function fadeFresh() { setTimeout(function () { S.fresh = null; var r = root.querySelector(".mp-row.is-fresh"); if (r) r.classList.remove("is-fresh"); }, 2400); }

  /* template mode: save asks for the name and the line about it */
  function saveTemplate() {
    var F = S.flow, bad = firstProblem();
    if (bad) { goStep(bad.k); showMsg(bad.v); return; }
    var cur = F.editId ? tplById(F.editId) : null;
    function put(name, about) {
      var t = clone(F.plan);
      t.name = name; t.about = about; t.status = "draft"; t.from = null;
      t.id = F.editId || newId("t"); t.own = cur ? cur.own : true;
      if (cur) S.templates[S.templates.indexOf(cur)] = t; else S.templates.push(t);
      openLibrary(S.libFrom, t.id); toast(cur ? "Template saved" : "Template added to your list");
    }
    /* the Sleep step carries the template's name and about; ask here only if it is still missing */
    if (String(F.plan.name || "").trim()) { put(F.plan.name.trim(), String(F.plan.about || "").trim()); return; }
    dialog({
      title: "Save Template",
      body: '<p>This is how it shows in your template list.</p>' +
        '<div class="mp-fld" data-fld><label for="mp-tn">Template name</label><input id="mp-tn" maxlength="60" value="' + esc(F.plan.name || "") + '" placeholder="For example, Gentle sleep reset"><span class="mp-err" data-err hidden>Give the template a name.</span></div>' +
        '<div class="mp-fld"><label for="mp-ta">About</label><textarea id="mp-ta" maxlength="140" placeholder="Who it suits, in one line">' + esc(F.plan.about || (cur && cur.about) || "") + "</textarea></div>",
      actions: [
        { label: "Cancel" },
        { label: "Save Template", cls: "is-primary", fn: function (d) {
          var name = d.querySelector("#mp-tn").value.trim();
          if (!name) { d.querySelector("[data-fld]").classList.add("is-bad"); d.querySelector("[data-err]").hidden = false; d.querySelector("#mp-tn").focus(); return false; }
          var about = d.querySelector("#mp-ta").value.trim();
          setTimeout(function () { put(name, about); }, 0);
        } }
      ]
    });
  }

  function askClose() {
    var F = S.flow;
    if (F && F.kind === "steps" && dirty()) {
      var plan = F.mode === "plan";
      dialog({
        title: "Leave without saving?",
        body: "<p>Your changes to this " + (plan ? "plan" : "template") + " will be lost." + (plan ? " Save it as a draft to finish it later." : "") + "</p>",
        actions: [{ label: "Discard Changes", cls: "is-danger", left: true, fn: function () { setTimeout(leave, 0); } }]
          .concat(plan ? [{ label: "Save as Draft", fn: function () { setTimeout(saveDraft, 0); } }] : [])
          .concat([{ label: "Keep Editing", cls: "is-primary" }])
      });
      return;
    }
    leave();
  }
  function leave() {
    var F = S.flow;
    if (F && F.kind === "steps" && F.mode === "template") return openLibrary(S.libFrom);
    if (F && F.kind === "library" && S.libFrom === "start") return openStart();
    closeFrame();
  }

  /* View: the plan in the review step, read-only */
  function openView(src) {
    S.view = "list";
    var plan = clone(src);
    S.flow = { kind: "view", mode: "plan", plan: plan, src: src };
    var f = frame(); f.setAttribute("aria-label", "View Mind Plan");
    var isDraft = src.status === "draft";
    f.innerHTML = bar("View Mind Plan", '<div class="mp-row-t"><span class="mp-row-n">' + esc(src.name) + '</span><span class="mp-st is-' + src.status + '">' + LABEL[src.status] + "</span></div>") +
      '<div class="mp-fscroll"><main class="mp-fmain mp-readonly"><div class="mp-ro-note">' + IC.eye + "<span>" + esc(dates(src)) + ". " +
      (isDraft ? "This is a draft. Edit it to finish and assign." : src.status === "active" ? "This plan is live for " + esc(patient()) + "." : "This plan has ended.") + '</span></div><div class="mp-step-el" data-el></div></main></div>' +
      '<footer class="mp-fbot"><div class="mp-sum"><i aria-hidden="true"></i><span data-sum>' + esc(summary(plan)) + '</span></div><div class="mp-acts">' +
      (isDraft ? '<button type="button" class="mp-btn is-primary" data-f="editview">Edit Draft</button>' : '<button type="button" class="mp-btn is-primary" data-f="close">Back to Mind Plans</button>') + "</div></footer>";
    renderModule(f.querySelector("[data-el]"), "review", plan, {
      mode: "plan", readOnly: true,
      go: function (k) { if (isDraft) editDraft(src, k); }
    });
    f.querySelector(".mp-fbot .mp-btn").focus();
    sync();
  }
  function editDraft(p, step) {
    var plan = clone(p); delete plan.saved;
    startFlow(plan, { mode: "plan", editId: p.id, isEdit: true, tId: p.from, step: step || "sleep", seenAll: true });
  }

  /* ---------- template library ---------- */
  function openLibrary(from, freshId) {
    S.libFrom = from || "list"; S.view = "library";
    S.flow = { kind: "library" };
    var f = frame(); f.setAttribute("aria-label", "Mind Plan Templates");
    var rows = S.templates.map(function (t) {
      var r = t.rhythm || {};
      return "<tr" + (t.id === freshId ? ' style="background:#F6FEF9"' : "") + '><td><span class="mp-tn">' + esc(t.name) + "</span>" + (t.own ? '<span class="mp-tag">Yours</span>' : "") + "</td>" +
        '<td class="mp-ta">' + esc(t.about || "") + '</td><td class="mp-nowrap">' + esc(window12(t)) + "</td>" +
        '<td class="mp-nowrap">' + (r.breathing || []).length + " breathing, " + (r.metime || []).length + " me-time</td>" +
        '<td class="mp-nowrap">' + (t.practices.length ? plural(t.practices.length, "practice") : "None") + "</td>" +
        '<td class="mp-tact"><button type="button" class="mp-btn is-sm" data-f="tedit" data-id="' + esc(t.id) + '" aria-label="Edit ' + esc(t.name) + '">Edit</button>' +
        '<button type="button" class="mp-btn is-sm" data-f="tdup" data-id="' + esc(t.id) + '" aria-label="Duplicate ' + esc(t.name) + '">Duplicate</button></td></tr>';
    }).join("");
    f.innerHTML = bar("Mind Plan Templates") + '<div class="mp-fscroll"><main class="mp-fmain is-wide mp-step-el">' +
      '<div class="mp-head"><div><h2>Templates</h2><p>Starting points for new Mind plans. Changing one leaves assigned plans as they are.</p></div>' +
      '<button type="button" class="mp-btn is-primary" data-f="tnew">' + IC.plus + "New Template</button></div>" +
      '<table class="mp-table"><thead><tr><th scope="col">Template</th><th scope="col">About</th><th scope="col">Sleep window</th><th scope="col">Self-care</th><th scope="col">Practices</th><th scope="col"><span class="mp-sr">Actions</span></th></tr></thead><tbody>' + rows + "</tbody></table>" +
      "</main></div>";
    sync();
    var x = f.querySelector('[data-f="tnew"]'); if (x) x.focus();
  }
  function duplicate(t) {
    var c = clone(t); c.id = newId("t"); c.name = t.name + " (copy)"; c.own = true;
    S.templates.splice(S.templates.indexOf(t) + 1, 0, c);
    openLibrary(S.libFrom, c.id);
    toast("Copy added. Edit it to make it yours.", "Undo", function () { S.templates.splice(S.templates.indexOf(c), 1); openLibrary(S.libFrom); });
  }
  function editTemplate(t, step) {
    var p = clone(t); delete p.own;
    startFlow(p, { mode: "template", editId: t.id, isEdit: true, tId: t.id, step: step || "sleep", seenAll: true });
  }

  /* one listener for everything inside the full-screen frame */
  document.addEventListener("click", function (e) {
    if (!full || !full.contains(e.target)) return;
    var b = e.target.closest("[data-f]"); if (!b || b.disabled) return;
    var a = b.dataset.f, F = S.flow;
    if (a === "close") { F && F.kind === "done" ? (closeFrame(), fadeFresh()) : askClose(); }
    if (a === "use") { var t = tplById(b.dataset.id); if (t) startFlow(fromTemplate(t), { mode: "plan", tId: t.id }); }
    if (a === "blank") { var bp = MP.blankPlan(); bp.name = "Mind Plan"; startFlow(bp, { mode: "plan" }); }
    if (a === "manage") openLibrary("start");
    if (a === "step") goStep(b.dataset.k);
    if (a === "next") next();
    if (a === "back") goStep(KEYS[KEYS.indexOf(F.step) - 1]);
    if (a === "draft") saveDraft();
    if (a === "finish") F.mode === "template" ? saveTemplate() : assign();
    if (a === "editview") editDraft(F.src);
    if (a === "tnew") { var p = MP.blankPlan(); startFlow(p, { mode: "template" }); }
    if (a === "tedit") editTemplate(tplById(b.dataset.id));
    if (a === "tdup") duplicate(tplById(b.dataset.id));
  });
  /* Escape on a full-screen page (no dialog open) closes it the same way the X does */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || e.defaultPrevented || dlgOpen || !full) return;
    if (document.querySelector('[role="dialog"]:not(.mp-dlg), [aria-expanded="true"]')) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    askClose();
  });

  /* ---------- deep links ---------- */
  function sync() {
    var p = new URLSearchParams(location.search), F = S.flow;
    ["view", "step", "t"].forEach(function (k) { p.delete(k); });
    if (S.view !== "list" && F) {
      p.set("view", S.view);
      if (F.kind === "steps") { p.set("step", F.step); if (F.tId) p.set("t", F.tId); }
    }
    var s = p.toString();
    try { history.replaceState(null, "", location.pathname + (s ? "?" + s : "")); } catch (e) {}
  }
  function seed() {
    var a = fromTemplate(tplById("t-sleep")); a.id = "demo-a"; a.name = "Sleep reset, November"; a.status = "active"; a.saved = 3;
    var d = fromTemplate(tplById("t-calm")); d.id = "demo-d"; d.name = "Calmer days, December"; d.status = "draft"; d.start = "2026-11-30"; d.end = "2026-12-27"; d.saved = 2;
    var i = fromTemplate(tplById("t-default")); i.id = "demo-i"; i.name = "Rhythm starter, October"; i.status = "inactive"; i.start = "2026-10-05"; i.end = "2026-11-01"; i.saved = 1;
    S.plans = [a, d, i];
  }
  function boot() {
    if (Q.get("demo") === "1") seed();
    renderShell();
    var view = Q.get("view"), step = Q.get("step"), t = tplById(Q.get("t"));
    if (KEYS.indexOf(step) < 0) step = null;
    var seeUpTo = function () { if (!step) return; for (var i = 0; i <= KEYS.indexOf(step); i++) S.flow.seen[KEYS[i]] = true; goStep(step, true); };
    if (view === "create") {
      if (t) { startFlow(fromTemplate(t), { mode: "plan", tId: t.id }); seeUpTo(); }
      else if (step) { var bp = MP.blankPlan(); bp.name = "Mind Plan"; startFlow(bp, { mode: "plan" }); seeUpTo(); }
      else openStart();
    } else if (view === "library") {
      if (t) editTemplate(t, step);
      else openLibrary("list");
    }
  }

  /* ---------- load the step modules (skip any that do not exist yet) ---------- */
  var FILES = ["rhythm", "practices", "review"];
  function load(i) {
    if (i >= FILES.length) return boot();
    var url = "/v7/coach-mind/" + FILES[i] + ".js";
    fetch(url, { cache: "no-store" })
      .then(function (r) { return r.ok && /javascript/.test(r.headers.get("content-type") || "") ? url : null; })
      .catch(function () { return null; })
      .then(function (u) {
        if (!u) return load(i + 1);
        var s = document.createElement("script");
        s.src = u + "?v=" + Date.now();
        s.onload = s.onerror = function () { load(i + 1); };
        document.head.appendChild(s);
      });
  }
  load(0);
})();
