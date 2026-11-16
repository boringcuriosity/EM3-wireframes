/* "All breathing exercises", variant a: Vitals cards.
   Each exercise is the GoodFlip Vitals entry card (Figma 7500:4651): a gold top wash fading to white, a 1px border with a
   gold tip at the top centre, the 2px hard shadow, radius 16. Title, one line on what it is for, the pattern as the big
   fact, a minutes tag, the exercise's own live visual in the corner where Vitals keeps its line drawing, a green chevron.
   Seven full cards would run long at the end of the screen, so three show and "See all 7" opens the rest in place
   and then goes away (the label never rewrites itself). The card opens the info sheet; the visual is a play button. */
(function () {
  var FOR = {
    coherent: "Settles your heart rhythm, any time of day",
    sleep: "Helps you drift off when you are in bed",
    box: "Steadies you before a big moment",
    exhale: "Slows you down when stress builds",
    belly: "The calmest way to breathe, from the belly",
    hum: "Quietens a busy mind before bed",
    pursed: "Eases breathlessness and slows your breath"
  };
  var WORD = { in: "in", hold: "hold", out: "out" };
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m10 7 5 5-5 5"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var SHOW = 3;

  var css = document.createElement("style");
  css.textContent = [
    ".bla-intro{margin:-8px 0 16px;font:400 14px/20px Roboto;color:var(--g-600);text-wrap:pretty}",
    ".bla-list{display:flex;flex-direction:column;gap:16px}",
    /* the Vitals entry card: wash, tipped border, hard shadow */
    ".bla-card{position:relative;isolation:isolate;overflow:hidden;display:block;width:100%;min-height:141px;padding:16px;border-radius:16px;border:1px solid transparent;text-align:left;cursor:pointer;color:var(--g-900);font:inherit;" +
      "box-shadow:2px 2px 0 var(--g-200);" +
      "background:linear-gradient(180deg,var(--gold-50) 0%,#fff 29%,#fff 100%) padding-box," +
      "conic-gradient(from 0deg,var(--gold-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--gold-600) 360deg) border-box;" +
      "transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".bla-card:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    ".bla-hd{display:flex;align-items:flex-start;gap:8px}",
    ".bla-hd .n{flex:1;min-width:0;font:600 16px/22px Roboto}",
    ".bla-go{flex:none;width:22px;height:22px;border-radius:50%;background:var(--brand-600);display:grid;place-items:center}.bla-go svg{width:16px;height:16px}",
    ".bla-for{margin-top:4px;font:400 12px/16px Roboto;color:var(--g-500);padding-right:24px}",
    /* the pattern as the big fact: each count large, its word small beside it, as Vitals does 72 bpm */
    ".bla-pat{display:flex;align-items:baseline;flex-wrap:wrap;column-gap:10px;row-gap:0;margin-top:16px;max-width:calc(100% - 92px)}",
    ".bla-pat span{white-space:nowrap;font:400 12px/16px Roboto;color:var(--g-500)}.bla-pat b{font:600 26px/30px Roboto;color:var(--g-900);letter-spacing:0;margin-right:3px;font-variant-numeric:tabular-nums}",
    ".bla-tags{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}",
    /* the verdict tag, in gold for minutes and green for the plan */
    ".bla-tag{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:8px;border:1px solid transparent;font:400 12px/14px Roboto;white-space:nowrap}",
    ".bla-tag.mn{color:var(--olive-700);background:linear-gradient(90deg,var(--gold-100) 0%,var(--gold-50) 19%,var(--gold-50) 84%,var(--gold-100) 100%) padding-box,linear-gradient(90deg,var(--gold-600),var(--gold-300) 30%,var(--gold-300) 70%,var(--gold-600)) border-box}",
    ".bla-tag.pl{color:var(--ok-600);background:linear-gradient(90deg,var(--ok-100) 0%,var(--ok-50) 19%,var(--ok-50) 84%,var(--ok-100) 100%) padding-box,linear-gradient(90deg,var(--ok-600),var(--ok-300) 30%,var(--ok-300) 70%,var(--ok-600)) border-box}",
    /* the live visual sits bottom right where Vitals keeps its drawing; it is also the play button */
    ".bla-art{position:absolute;right:14px;bottom:14px;width:76px;height:76px;border:0;padding:0;border-radius:50%;background:none;cursor:pointer;z-index:1}",
    ".bla-art .bl-mini{background:radial-gradient(circle,#fff 30%,var(--gold-50) 100%);box-shadow:0 0 0 1px var(--gold-200)}",
    ".bla-art .pb{position:absolute;right:-4px;bottom:-4px;width:26px;height:26px;border-radius:50%;background:#fff;color:var(--brand-600);display:grid;place-items:center;box-shadow:0 0 0 1px var(--g-200),0 2px 6px rgba(16,24,40,.10)}",
    ".bla-art .pb svg{width:14px;height:14px;margin-left:2px}",
    ".bla-art::after{content:'';position:absolute;inset:-4px}",
    ".bla-more{display:flex;align-items:center;justify-content:center;gap:4px;width:100%;height:48px;margin-top:8px;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".bla-more svg{width:18px;height:18px}",
    ".bla-card.rest{animation:blaIn .32s var(--ease) both}",
    "@keyframes blaIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion:reduce){.bla-card.rest{animation:none}}"
  ].join("");
  document.head.appendChild(css);

  function pat(b) {
    return b.seq.map(function (x) { return '<span><b>' + x.s + '</b>' + (x.k === "out" && b.key === "hum" ? "hum" : WORD[x.k]) + '</span>'; }).join("");
  }
  function card(b, B, rest) {
    var el = document.createElement("div");
    el.className = "bla-card" + (rest ? " rest" : "");
    el.setAttribute("role", "button"); el.tabIndex = 0;
    el.setAttribute("data-blinfo", b.key);
    el.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. Opens how it works");
    el.innerHTML = '<div class="bla-hd"><div class="n">' + b.name.replace(/\s*\(.*\)$/, "") + '</div><span class="bla-go" aria-hidden="true">' + CHEV + '</span></div>' +
      '<div class="bla-for">' + FOR[b.key] + '</div>' +
      '<div class="bla-pat" aria-hidden="true">' + pat(b) + '</div>' +
      '<div class="bla-tags"><span class="bla-tag mn">' + b.min + ' min</span>' + (B.state === "plan" && b.inPlan ? '<span class="bla-tag pl">In your plan</span>' : "") + '</div>' +
      '<button class="bla-art" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '"><span class="pb">' + PLAY + '</span></button>';
    var art = el.querySelector(".bla-art");
    art.insertBefore(B.mini(b.key, 76), art.firstChild);
    return el;
  }

  BLIB.add("a", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "free" ? "Start any of these whenever you need a pause."
        : B.state === "noplan" ? "Your coach has not set your plan yet. Start any of these whenever you like."
        : "Start any of these whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="sec"><h2>Breathing exercises</h2><span>' + B.list.length + ' to try</span></div><p class="bla-intro">' + intro + '</p><div class="bla-list"></div>';
      var list = host.querySelector(".bla-list");
      B.list.slice(0, SHOW).forEach(function (b) { list.appendChild(card(b, B)); });
      var more = document.createElement("button");
      more.className = "bla-more";
      more.innerHTML = 'See all ' + B.list.length + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
      more.onclick = function () {
        B.list.slice(SHOW).forEach(function (b) { list.appendChild(card(b, B, true)); });
        more.remove();
      };
      host.appendChild(more);
      if (/[?&]lall=1/.test(location.search)) more.click();
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("bla-card")) { e.preventDefault(); e.target.click(); } });
    }
  });
})();
