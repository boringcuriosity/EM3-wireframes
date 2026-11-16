/* All breathing exercises, variant i: "How do you feel?". Feelings come first. Picking one brings up the best
   exercise for it as a featured card (its live visual, a line on why, Start) with a second one to try, and the
   full seven sit below as a compact list. Late in the evening (the prototype clock, ?now=) "Can't sleep" is picked
   for you; otherwise nothing is picked and a gentle line invites a choice. The choice lasts for the session only.
   ?lfeel=sleep|stress|focus|breath|calm picks one for review. */
(function () {
  var FEEL = [
    { id: "sleep", t: "Can't sleep", k: "sleep", alt: "hum", why: "A long, slow breath out tells your body it is safe to wind down. Do it lying in bed." },
    { id: "stress", t: "Stressed", k: "exhale", alt: "box", why: "Breathing out for twice as long as you breathe in slows your heart within a few breaths." },
    { id: "focus", t: "Can't focus", k: "box", alt: "coherent", why: "Four equal steps give your mind one simple thing to follow, so it stops jumping around." },
    { id: "breath", t: "Short of breath", k: "pursed", alt: "belly", why: "Breathing out through pursed lips keeps your airways open longer, so each breath goes further." },
    { id: "calm", t: "Just want calm", k: "coherent", alt: "belly", why: "Six slow breaths a minute is the pace your body settles into most easily." }
  ];
  var E = "cubic-bezier(.4,0,.2,1)";
  var TICK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  var css = document.createElement("style");
  css.textContent =
    ".bli-w{display:flex;flex-direction:column;gap:24px}" +
    ".bli-c{border-radius:24px;border:1px solid transparent;box-shadow:2px 2px 0 #E4E7EC;padding:20px 16px 16px;" +
      "background:linear-gradient(180deg,#FFFBEE 0%,#FFF 34%) padding-box,conic-gradient(from 0deg,#E7C144 0deg,#E4E7EC 43deg,#E4E7EC 317deg,#E7C144 360deg) border-box}" +
    ".bli-q{font:600 16px/22px Roboto,sans-serif;color:#101828;margin:0 0 12px}" +
    ".bli-ch{display:flex;flex-wrap:wrap;gap:8px}" +
    ".bli-chip{position:relative;height:36px;display:inline-flex;align-items:center;gap:4px;padding:0 14px;border-radius:999px;border:1px solid #E4E7EC;background:#fff;" +
      "font:500 14px/20px Roboto,sans-serif;color:#344054;cursor:pointer;transition:background .2s " + E + ",border-color .2s " + E + ",color .2s " + E + ",padding .2s " + E + "}" +
    ".bli-chip::after{content:'';position:absolute;left:0;right:0;top:-4px;bottom:-4px}" +
    ".bli-chip svg{width:0;transition:width .2s " + E + "}" +
    ".bli-chip.on{background:#E6FAF1;border-color:#299D6B;color:#2A805A;padding-left:10px}.bli-chip.on svg{width:16px}" +
    /* the suggestion: empty until a feeling is picked */
    ".bli-f{margin-top:16px;border-top:1px solid #F2F4F7;padding-top:16px}" +
    ".bli-e{display:flex;align-items:center;gap:12px;font:400 14px/20px Roboto,sans-serif;color:#667085}" +
    ".bli-e .bl-mini{opacity:.55}" +
    ".bli-s{animation:bliIn .32s " + E + " both}@keyframes bliIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    ".bli-hd{display:flex;align-items:center;gap:16px}" +
    ".bli-hd .bl-mini{background:transparent}" +
    ".bli-ey{font:600 12px/16px Roboto,sans-serif;letter-spacing:.4px;color:#A68A2D}" +
    ".bli-n{font:600 18px/24px Roboto,sans-serif;color:#101828;margin-top:2px}" +
    ".bli-p{font:400 12px/16px Roboto,sans-serif;color:#667085;margin-top:4px}" +
    ".bli-why{font:400 14px/20px Roboto,sans-serif;color:#475467;margin:12px 0 16px}" +
    ".bli-go{width:100%;height:48px;border:0;border-radius:8px;background:#299D6B;color:#fff;font:600 15px Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 3px 0 #2A805A}" +
    ".bli-go:active{transform:translateY(2px);box-shadow:0 1px 0 #2A805A}" +
    ".bli-mo{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px}" +
    ".bli-lk{height:44px;display:inline-flex;align-items:center;gap:6px;border:0;background:none;padding:0 4px;font:500 13px Roboto,sans-serif;color:#475467;cursor:pointer;white-space:nowrap}" +
    ".bli-lk b{font-weight:600;color:#2A805A}" +
    ".bli-tag{display:inline-block;margin-left:6px;font:500 11px/16px Roboto,sans-serif;color:#2A805A;background:#E6FAF1;border:1px solid #CBF0E0;border-radius:8px;padding:1px 6px;vertical-align:1px}" +
    /* all seven, compact */
    ".bli-h3{font:600 14px/20px Roboto,sans-serif;color:#101828;margin:0 0 8px}" +
    ".bli-l{border:1px solid #EAECF0;border-radius:16px;background:#fff;overflow:hidden}" +
    ".bli-r{display:flex;align-items:center;gap:12px;padding:8px 4px 8px 12px;min-height:64px;cursor:pointer;transition:background .2s " + E + "}" +
    ".bli-r+.bli-r{border-top:1px solid #F2F4F7}.bli-r:active{background:#FFFDF5}" +
    ".bli-r .bl-mini{background:#FFFBEE}" +
    ".bli-r .tx{flex:1;min-width:0}.bli-r .rn{font:600 14px/20px Roboto,sans-serif;color:#101828}.bli-r .rp{font:400 12px/16px Roboto,sans-serif;color:#667085;margin-top:2px}" +
    ".bli-r.pick{background:#FFFDF5}" +
    ".bli-pl{width:44px;height:44px;flex:none;border:0;background:none;display:grid;place-items:center;cursor:pointer;padding:0}" +
    ".bli-pl i{width:32px;height:32px;border-radius:50%;border:1px solid #A6E9C9;background:#F3FCF8;color:#2A805A;display:grid;place-items:center}.bli-pl i svg{width:14px;height:14px;margin-left:2px}";
  document.head.appendChild(css);

  function nm(b) { return b.name.replace(/\s*\([0-9][0-9:-]*\)$/, ""); }
  function store(v) { try { if (v === undefined) return sessionStorage.getItem("blFeel"); sessionStorage.setItem("blFeel", v); } catch (e) { return null; } }

  BLIB.add("i", {
    render: function (host, B) {
      host.className = "gut";
      var plan = B.state === "plan", Q = new URLSearchParams(location.search), now = window.MDPLAN ? MDPLAN.now : new Date().getHours();
      var pick = Q.get("lfeel") || store() || (now >= 21 || now < 5 ? "sleep" : "");
      var tag = function (b) { return plan && b.inPlan ? '<span class="bli-tag">In your plan</span>' : ""; };
      host.innerHTML = '<div class="sec"><h2>All breathing exercises</h2><span>7 to try</span></div><div class="bli-w">' +
        '<div class="bli-c"><p class="bli-q">How do you feel right now?</p><div class="bli-ch" role="radiogroup" aria-label="How do you feel">' +
        FEEL.map(function (f) { return '<button class="bli-chip" role="radio" data-f="' + f.id + '">' + TICK + f.t + '</button>'; }).join("") +
        '</div><div class="bli-f" aria-live="polite"></div></div>' +
        '<div><p class="bli-h3">All seven</p><div class="bli-l"></div></div></div>';
      var chips = host.querySelectorAll(".bli-chip"), F = host.querySelector(".bli-f"), L = host.querySelector(".bli-l");
      B.list.forEach(function (b) {
        var r = document.createElement("div"); r.className = "bli-r"; r.dataset.k = b.key;
        r.setAttribute("data-blinfo", b.key); r.setAttribute("role", "button"); r.tabIndex = 0;
        r.innerHTML = '<div class="tx"><div class="rn">' + nm(b) + tag(b) + '</div><div class="rp">' + b.pat + ' · ' + b.min + ' min</div></div>' +
          '<button class="bli-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '"><i>' + PLAY + '</i></button>';
        r.insertBefore(B.mini(b.key, 44), r.firstChild); L.appendChild(r);
      });
      function show(id) {
        var f = FEEL.filter(function (x) { return x.id === id; })[0];
        chips.forEach(function (c) { c.classList.toggle("on", c.dataset.f === id); c.setAttribute("aria-checked", c.dataset.f === id); });
        L.querySelectorAll(".bli-r").forEach(function (r) { r.classList.toggle("pick", !!f && r.dataset.k === f.k); });
        if (!f) {
          F.innerHTML = '<div class="bli-e"><span class="bli-sl"></span><span>Pick one and we will suggest a breathing exercise to try now.</span></div>';
          F.querySelector(".bli-sl").replaceWith(B.mini("coherent", 48));
          return;
        }
        var b = B.get(f.k), a = B.get(f.alt);
        F.innerHTML = '<div class="bli-s"><div class="bli-hd"><span class="bli-sl"></span><div><div class="bli-ey">TRY THIS</div><div class="bli-n">' + nm(b) + '</div>' +
          '<div class="bli-p">' + b.pat + ' · ' + b.min + ' min' + tag(b) + '</div></div></div>' +
          '<p class="bli-why">' + f.why + '</p>' +
          '<button class="bli-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + 'Start, ' + b.min + ' min</button>' +
          '<div class="bli-mo"><button class="bli-lk" data-blinfo="' + b.key + '">' + INFO + 'How it works</button>' +
          '<button class="bli-lk" data-blinfo="' + a.key + '">Or try <b>' + a.short + '</b>' + CHEV + '</button></div></div>';
        F.querySelector(".bli-sl").replaceWith(B.mini(b.key, 104));
      }
      chips.forEach(function (c) { c.onclick = function () { var id = c.classList.contains("on") ? "" : c.dataset.f; store(id); show(id); }; });
      show(pick);
    }
  });
})();
