/* "All breathing exercises", variant b: Plan-card list.
   One card in the exact shape of the "Your mind plan" cards directly above it (move/plan.css .mv-card, mind/layouts.js),
   so the library reads as part of the same page. Each exercise is the plan's own row: where the plan has its tick,
   this has the exercise's live 40px visual with a play mark (Move's video thumbnails do the same), then the name and
   pattern, then minutes and a chevron. The row opens the info sheet; the visual starts it.
   Under the card title, Eat's frosted info chip ("How to choose") opens a sheet that matches each feeling to its exercises. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var ORDER = ["Calm", "Stress", "Focus", "Sleep", "Busy mind", "Digestion", "Breathless"];
  var FEEL = { Calm: "To feel calmer", Stress: "When stress builds", Focus: "Before something that needs focus", Sleep: "At bedtime", "Busy mind": "When your mind will not settle", Digestion: "After a meal", Breathless: "When you feel out of breath" };

  var css = document.createElement("style");
  css.textContent = [
    ".blb-card .mv-mh{align-items:flex-start}",
    /* Eat's .minfo chip, copied rather than shared so Eat's own .minfo tap handler never sees it */
    ".blb-chip{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:4px;margin-top:8px;height:24px;padding:0 10px 0 6px;border-radius:9999px;cursor:pointer;" +
      "border:1px solid rgb(255 255 255 / .9);background:linear-gradient(180deg,rgb(255 255 255 / .85),rgb(255 255 255 / .35));-webkit-backdrop-filter:blur(10px) saturate(1.6);backdrop-filter:blur(10px) saturate(1.6);" +
      "box-shadow:inset 0 1px 0 #fff,inset 0 -1px 0 rgb(152 162 179 / .25),0 2px 8px rgb(16 24 40 / .08);font:500 12px/1 Roboto,sans-serif;letter-spacing:.25px;color:var(--g-800)}",
    ".blb-chip::after{content:'';position:absolute;inset:-10px -2px}.blb-chip svg{position:relative;z-index:1;width:14px;height:14px;color:var(--g-600)}.blb-chip span{position:relative;z-index:1}",
    ".blb-chip::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;background:linear-gradient(105deg,transparent 35%,rgb(255 255 255 / .95) 50%,transparent 65%);background-size:250% 100%;background-position:150% 0;animation:chipShine 4.5s cubic-bezier(.4,0,.2,1) 1s infinite}",
    "@media (prefers-reduced-motion:reduce){.blb-chip::before{animation:none}}",
    /* the gold wash on the card's own top, in place of the plan's indigo: same stops, same tip */
    ".blb-card{background:linear-gradient(180deg,var(--gold-50) 0%,#fff 29%,#fff 100%) padding-box,conic-gradient(from 0deg,var(--gold-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--gold-600) 360deg) border-box}",
    ".blb-card .mv-tiplist{gap:16px}",
    ".blb-row{align-items:center !important}",
    /* the visual sits where the tick sits, a 44px target around a 40px circle */
    ".blb-pl{position:relative;flex:none;width:40px;height:40px;border:0;padding:0;border-radius:50%;background:none;cursor:pointer}",
    ".blb-pl::after{content:'';position:absolute;inset:-2px}",
    ".blb-pl .bl-mini{box-shadow:0 0 0 1px var(--gold-200);background:radial-gradient(circle,#fff 35%,var(--gold-50))}",
    ".blb-pl .pb{position:absolute;right:-3px;bottom:-3px;width:18px;height:18px;border-radius:50%;background:#fff;color:var(--brand-600);display:grid;place-items:center;box-shadow:0 0 0 1px var(--g-200)}",
    ".blb-pl .pb svg{width:10px;height:10px;margin-left:1px}",
    ".blb-row .tt{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
    ".blb-in{font:500 11px/16px Roboto;color:var(--ok-600);background:var(--ok-50);border-radius:6px;padding:0 6px;letter-spacing:.2px}",
    ".blb-row .ly-rb{min-height:44px;justify-content:center}",
    ".blb-row .ly-tm{align-self:center}.blb-row .ly-tm svg{margin-top:0}",
    /* the how-to-choose sheet */
    ".blb-ch{display:flex;flex-direction:column}.blb-ch .r{padding:12px 0;border-top:1px dashed var(--g-200)}.blb-ch .lead+.r{border-top:0;padding-top:0}",
    ".blb-ch h5{margin:0 0 8px;font:600 14px/20px Roboto;color:var(--g-900)}.blb-ch .ls{display:flex;flex-wrap:wrap;gap:8px}",
    ".blb-ch .ls button{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:4px 12px 4px 4px;border:1px solid var(--g-200);border-radius:9999px;background:#fff;font:500 13px/18px Roboto;color:var(--g-800);cursor:pointer}",
    ".blb-ch .ls .bl-mini{pointer-events:none}",
    ".blb-ch .lead{font:400 14px/20px Roboto;color:var(--g-600);margin:0 0 16px}"
  ].join("");
  document.head.appendChild(css);

  function row(b, B) {
    var d = document.createElement("div");
    d.className = "mv-tip tip ly-row blb-row";
    d.innerHTML = '<button class="blb-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '"><span class="pb">' + PLAY + '</span></button>' +
      '<button class="ly-rb" data-blinfo="' + b.key + '" aria-label="' + b.name + ', ' + b.pat + '. How it works"><span class="tt">' + b.name.replace(/\s*\(.*\)$/, "") +
        (B.state === "plan" && b.inPlan ? '<span class="blb-in">In your plan</span>' : "") + '</span><span class="td">' + b.pat + '</span></button>' +
      '<span class="ly-tm" data-blinfo="' + b.key + '"><span class="ly-at">' + b.min + ' min</span>' + CHEV + '</span>';
    var pl = d.querySelector(".blb-pl"); pl.insertBefore(B.mini(b.key, 40), pl.firstChild);
    return d;
  }

  function chooser(B) {
    var html = '<div class="blb-ch"><p class="lead">Pick by how you feel. Tap one to see how it goes.</p>' + ORDER.map(function (g) {
      var hits = B.list.filter(function (b) { return b.good.indexOf(g) >= 0; });
      return !hits.length ? "" : '<div class="r"><h5>' + FEEL[g] + '</h5><div class="ls">' + hits.map(function (b) { return '<button data-blinfo="' + b.key + '" data-k="' + b.key + '"><i></i>' + b.name.replace(/\s*\(.*\)$/, "") + '</button>'; }).join("") + '</div></div>';
    }).join("") + '</div>';
    var el = window.GFOpenSheet ? window.GFOpenSheet("blbChoose", "How to choose", html) : null;
    if (el) el.querySelectorAll(".ls button").forEach(function (b) { b.querySelector("i").replaceWith(B.mini(b.dataset.k, 32)); });
  }

  BLIB.add("b", {
    render: function (host, B) {
      host.className = "gut sect";
      var sub = B.state === "noplan" ? B.list.length + " exercises · use them while your plan is set up"
        : B.state === "free" ? B.list.length + " exercises · start one whenever you need a pause"
        : B.list.length + " exercises · in your plan or not";
      host.innerHTML = '<div class="sec"><h2>Breathing exercises</h2></div>' +
        '<section class="mv-card blb-card"><div class="mv-mh"><div class="t"><div class="n">Any time</div><div class="s">' + sub + '</div>' +
        '<button class="blb-chip">' + INFO + '<span>How to choose</span></button></div></div>' +
        '<div class="mv-mbi"><div class="mv-tiplist"></div></div></section>';
      var list = host.querySelector(".mv-tiplist");
      B.list.forEach(function (b) { list.appendChild(row(b, B)); });
      host.querySelector(".blb-chip").onclick = function (e) { e.stopPropagation(); chooser(B); };
      if (/[?&]lchoose=1/.test(location.search)) chooser(B);
    }
  });
})();
