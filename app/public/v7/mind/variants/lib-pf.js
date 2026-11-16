/* "All breathing exercises", variant pf: Rhythm pills (after "Downshift").
   Light indigo cards. Each one reads top to bottom: the name, what it is for in a few words, then the breath itself as a
   row of still pills, one per step, each as wide as its seconds: In is filled indigo, Hold is an outline, Out (or Hum)
   is a soft tint. So 4-7-8 shows a short In, a longer Hold and the longest Out at a glance, and Box is four equal pills.
   Minutes and Start sit in the footer. The card opens the info sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var FOR = { coherent: "An even rhythm to settle you", sleep: "Helps you drift off to sleep", box: "Steadies you before a big task", exhale: "Slows you down when stressed",
    belly: "Relaxes your belly and body", hum: "Quietens a busy mind", pursed: "Eases breathlessness" };
  var word = function (x) { return x.k === "hold" ? "Hold" : x.k === "in" ? "In" : /hum/i.test(x.word) ? "Hum" : "Out"; };
  var pills = function (b, cls) {
    return '<span class="' + cls + '">' + b.seq.map(function (x) {
      return '<span class="blpf-pl ' + x.k + '" style="flex-grow:' + x.s + '"><span class="w">' + word(x) + '</span><span class="v">' + x.s + ' s</span></span>';
    }).join("") + '</span>';
  };

  var css = document.createElement("style");
  css.textContent = [
    ".blpf-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpf-hd h2{margin:0}",
    ".blpf-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpf-all::after{content:'';position:absolute;inset:-6px -8px}.blpf-all svg{width:18px;height:18px}",
    ".blpf-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpf-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpf-rail::-webkit-scrollbar{display:none}",
    /* the card: a light indigo wash, the plan card's border and hard shadow */
    ".blpf-t{position:relative;flex:0 0 256px;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:var(--r-xl);border:1px solid var(--in-100);cursor:pointer;text-align:left;color:var(--g-900);" +
      "background:linear-gradient(180deg,var(--in-50) 0%,var(--in-25) 70%,#fff 100%);box-shadow:2px 2px 0 var(--in-100);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blpf-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--in-100)}",
    ".blpf-n{font:600 16px/22px Roboto;white-space:nowrap}",
    ".blpf-s{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-600);white-space:nowrap}",
    /* the breath, as still pills sized by their seconds */
    ".blpf-row{display:flex;gap:4px;margin-top:16px}",
    ".blpf-pl{flex:1 1 0;min-width:0;height:48px;border-radius:var(--r-md);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-variant-numeric:tabular-nums}",
    ".blpf-pl .w{font:600 10px/12px Roboto;letter-spacing:.8px;text-transform:uppercase;opacity:.8}.blpf-pl .v{font:600 14px/18px Roboto;letter-spacing:0;white-space:nowrap}",
    ".blpf-pl.in{background:var(--in-600);color:#fff}",
    ".blpf-pl.hold{background:rgb(255 255 255 / .7);box-shadow:inset 0 0 0 1px var(--in-300);color:var(--in-700)}",
    ".blpf-pl.out{background:var(--in-100);color:var(--in-900)}",
    ".blpf-f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:16px;min-height:36px}",
    ".blpf-l{display:flex;align-items:center;gap:8px;min-width:0}",
    ".blpf-mn{display:inline-flex;white-space:nowrap;align-items:center;gap:4px;font:500 12px/16px Roboto;color:var(--g-600);font-variant-numeric:tabular-nums}.blpf-mn svg{width:14px;height:14px;color:var(--in-400)}",
    ".blpf-in{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--r-pill);background:#fff;box-shadow:inset 0 0 0 1px var(--ok-100);font:500 11px/16px Roboto;color:var(--ok-600);white-space:nowrap}",
    ".blpf-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blpf-go{position:relative;display:inline-flex;align-items:center;gap:4px;height:36px;padding:0 14px 0 10px;border:1px solid var(--in-200);border-radius:var(--r-pill);background:#fff;font:600 14px/20px Roboto;color:var(--in-700);cursor:pointer;transition:background .18s var(--ease)}",
    ".blpf-go::after{content:'';position:absolute;inset:-4px}.blpf-go svg{width:16px;height:16px}.blpf-go:active{background:var(--in-50)}",
    /* See all: name and pattern, and the same pills drawn small */
    ".blpf-ls{display:flex;flex-direction:column}.blpf-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpf-r:first-child{border-top:0}.blpf-r .t{flex:1;min-width:0}.blpf-r .tt{display:block;font:600 14px/20px Roboto}.blpf-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpf-r .mr{display:flex;gap:2px;width:72px;flex:none}.blpf-r .mr .blpf-pl{height:8px;border-radius:999px}.blpf-r .mr .w,.blpf-r .mr .v{display:none}",
    ".blpf-r .rt{display:inline-flex;align-items:center;gap:4px;min-width:52px;justify-content:flex-end;font:400 12px/16px Roboto;color:var(--g-500)}.blpf-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpf-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div");
    t.className = "blpf-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", " + FOR[b.key] + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blpf-n">' + nm(b) + '</div><div class="blpf-s">' + FOR[b.key] + '</div>' + pills(b, "blpf-row") +
      '<div class="blpf-f"><span class="blpf-l"><span class="blpf-mn">' + CLOCK + b.min + ' min</span>' + (B.state === "plan" && b.inPlan ? '<span class="blpf-in">In your plan</span>' : "") + '</span>' +
      '<button class="blpf-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + 'Start</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blpf-sl">Tap one to see how it goes, or start it from there.</p><div class="blpf-ls">' + B.list.map(function (b) {
      return '<button class="blpf-r" data-blinfo="' + b.key + '"><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span>' + pills(b, "mr") + '<span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpfAll", "Breathing exercises", html);
  }

  BLIB.add("pf", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpf-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpf-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpf-intro">' + intro + '</p><div class="blpf-rail"></div>';
      var rail = host.querySelector(".blpf-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blpf-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpf-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
