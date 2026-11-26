/* Door: Pick a door. A big question, then Eat, Move and Mind as a fanned stack of three soft gradient scenes:
   the centre card upright, the other two peeking behind it, slightly turned. Swipe or tap a side card to bring
   it forward; tap the centre card to open that pillar. Intent chips under the fan bring the best pillar forward. */
(function () {
  var X = "dfan-", E = "cubic-bezier(.2,0,0,1)", FAN = ["eat", "move", "mind"];
  var SHORT = { sleep: "Sleep", bfast: "Breakfast", walk: "Walk", lunch: "Lunch", breath: "Breathing", stairs: "Stairs", snack: "Snack", gym: "Workout", dinner: "Dinner", mood: "Mood", wind: "Wind-down" };
  /* one line per plan item, why it is worth doing at this hour */
  var PITCH = {
    sleep: "How you slept sets how breakfast lands.",
    bfast: "Protein first keeps you full until lunch.",
    walk: "Twenty easy minutes, steadier sugar for hours.",
    lunch: "Vegetables first, then roti, for a gentler rise.",
    breath: "Five slow minutes calms the afternoon rise.",
    stairs: "Two minutes of stairs puts sugar to work.",
    snack: "A small protein snack keeps dinner light.",
    gym: "Strength builds the muscle that uses sugar.",
    dinner: "An earlier dinner gives sugar time to settle.",
    mood: "Naming the day makes stress easier to spot.",
    wind: "Phone away now, easier sleep later."
  };
  var INTENTS = [["quick", "Quick"], ["calm", "Calm"], ["fuel", "Fuel up"], ["move", "Move a little"]];
  var POSE = { c: { x: 0, r: 0, s: 1, z: 3 }, l: { x: -78, r: -7, s: .86, z: 2 }, r: { x: 78, r: 7, s: .86, z: 1 } };

  var css = [
    "." + X + "q{margin:4px 0 12px;text-align:center;font:700 24px/30px Roboto;color:#101828;letter-spacing:-.3px;transition:opacity .3s " + E + "}",
    "." + X + "st{position:relative;height:264px;margin:0 -16px;touch-action:pan-y;user-select:none;-webkit-user-select:none}",
    /* a soft halo behind the fan in the centre pillar's colour */
    "." + X + "st::before{content:'';position:absolute;left:50%;top:50%;width:300px;height:220px;margin:-110px 0 0 -150px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--halo) 22%,transparent),transparent);transition:background .6s " + E + ";pointer-events:none}",
    "." + X + "c{position:absolute;left:76px;top:8px;width:208px;height:248px;border-radius:28px;overflow:hidden;border:0;padding:0;cursor:pointer;font:inherit;text-align:left;color:#fff;transform-origin:50% 90%;" +
      "box-shadow:0 18px 32px -16px color-mix(in srgb,var(--d) 60%,transparent),0 2px 6px rgba(16,24,40,.08);transition:transform .55s " + E + ",filter .55s " + E + ",box-shadow .55s " + E + "}",
    "." + X + "st.drag ." + X + "c{transition:none}",
    "." + X + "c:focus-visible{outline:3px solid var(--c);outline-offset:3px}",
    "." + X + "c[data-pos=l],." + X + "c[data-pos=r]{filter:saturate(.85) brightness(1.04)}",
    "." + X + "c svg.sc{position:absolute;inset:0;width:100%;height:100%;display:block}",
    "." + X + "sh{position:absolute;left:0;right:0;bottom:0;height:58%;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--d) 80%,#101828) 100%);opacity:.92}",
    "." + X + "tp{position:absolute;left:12px;right:12px;top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px}",
    "." + X + "gs{height:28px;padding:0 10px 0 6px;border-radius:999px;background:rgba(255,255,255,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:inline-flex;align-items:center;gap:6px;font:600 12px/1 Roboto;color:#101828;white-space:nowrap}",
    "." + X + "gs i{width:20px;height:20px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-style:normal}",
    "." + X + "gs b{font:500 15px/1 'Playfair Display',serif}",
    "." + X + "gs.now,." + X + "gs.fut{padding:0 10px;color:var(--d)}",
    "." + X + "gs.now::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--c)}",
    "." + X + "bt{position:absolute;left:16px;right:16px;bottom:16px}",
    "." + X + "bt b{display:block;font:700 24px/28px Roboto;letter-spacing:-.2px}",
    "." + X + "bt span{display:block;margin-top:4px;font:400 13px/18px Roboto;opacity:.92}",
    "." + X + "c[data-pos=l] ." + X + "bt,." + X + "c[data-pos=r] ." + X + "bt,." + X + "c[data-pos=l] ." + X + "tp,." + X + "c[data-pos=r] ." + X + "tp{opacity:0;transition:opacity .3s " + E + "}",
    "." + X + "bt,." + X + "tp{transition:opacity .4s " + E + " .15s}",
    "." + X + "dots{display:flex;justify-content:center;gap:6px;margin:4px 0 12px}",
    "." + X + "dots i{width:6px;height:6px;border-radius:3px;background:#D0D5DD;transition:width .4s " + E + ",background .4s " + E + "}",
    "." + X + "dots i.on{width:18px;background:var(--c)}",
    "." + X + "ch{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:0 16px}",
    "." + X + "ch::-webkit-scrollbar{display:none}",
    "." + X + "ch .he-chip{flex:none;height:40px}",
    "." + X + "ch .he-chip[aria-pressed=true]{background:#F3FCF8;border-color:#299D6B;color:#2A805A}",
    "@media (prefers-reduced-motion: reduce){." + X + "c,." + X + "dots i,." + X + "st::before{transition:none}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* the scenes: soft layered gradient landscapes, one per pillar; evening and night darken the sky and bring the moon */
  function scene(p, part) {
    var id = X + p + Math.random().toString(36).slice(2, 6), late = part === "evening" || part === "night", night = part === "night";
    var S = {
      eat: { sky: night ? ["#2A805A", "#7FCFAA"] : late ? ["#FDE7C8", "#9FDDBF"] : ["#F3FCF8", "#9FE0C2"], h: ["#7FD3AB", "#45B884", "#299D6B", "#1F6E4C"] },
      move: { sky: night ? ["#2B2F8F", "#8A93F2"] : late ? ["#FFD9C7", "#A9B4FF"] : ["#F5F8FF", "#B4C1FF"], h: ["#9AA3F5", "#6C74EE", "#444CE7", "#2B2FA8"] },
      mind: { sky: night ? ["#1F5F6A", "#7CCACA"] : late ? ["#FBE3D2", "#97DCDC"] : ["#F5FFFF", "#A4E4E4"], h: ["#86D3D3", "#52BDBD", "#2DA6A6", "#1F7F7F"] }
    }[p];
    var orb = night ? '<circle cx="150" cy="54" r="18" fill="#FFFDF5" opacity=".95"/><circle cx="158" cy="48" r="16" fill="url(#' + id + 's)" opacity=".9"/>' :
      '<circle cx="148" cy="60" r="34" fill="#fff" opacity=".35"/><circle cx="148" cy="60" r="20" fill="#FFFDF5" opacity=".95"/>';
    var land = {
      /* rolling hills with rows of crops */
      eat: '<path d="M0 128C40 108 80 112 120 124S180 132 200 118V240H0Z" fill="' + S.h[0] + '"/>' +
        '<path d="M0 150C50 134 100 142 140 152S190 150 200 144V240H0Z" fill="' + S.h[1] + '"/>' +
        '<path d="M0 176C60 160 120 170 200 162V240H0Z" fill="' + S.h[2] + '"/>' +
        '<g stroke="#fff" stroke-opacity=".18" stroke-width="2" fill="none"><path d="M0 188C60 174 120 182 200 174"/><path d="M0 200C60 186 120 194 200 186"/><path d="M0 212C60 198 120 206 200 198"/></g>' +
        '<path d="M0 214C70 204 130 210 200 204V240H0Z" fill="' + S.h[3] + '"/>',
      /* layered ridges with a path winding into them */
      move: '<path d="M0 132 38 100 70 122 112 84 150 118 176 100 200 112V240H0Z" fill="' + S.h[0] + '"/>' +
        '<path d="M0 156 46 128 88 150 130 118 170 146 200 132V240H0Z" fill="' + S.h[1] + '"/>' +
        '<path d="M0 182C50 166 110 176 200 160V240H0Z" fill="' + S.h[2] + '"/>' +
        '<path d="M104 240C96 220 120 206 112 192S96 176 104 166" stroke="#fff" stroke-opacity=".5" stroke-width="7" stroke-linecap="round" fill="none"/>' +
        '<path d="M0 216C60 206 140 212 200 202V240H0Z" fill="' + S.h[3] + '"/>',
      /* a still lake with slow ripples */
      mind: '<path d="M0 128C30 116 60 120 90 126S150 118 200 124V240H0Z" fill="' + S.h[0] + '"/>' +
        '<rect y="140" width="200" height="100" fill="' + S.h[1] + '"/>' +
        '<ellipse cx="148" cy="150" rx="26" ry="3" fill="#fff" opacity=".35"/>' +
        '<g fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"><ellipse cx="80" cy="176" rx="22" ry="5"/><ellipse cx="80" cy="176" rx="40" ry="9"/><ellipse cx="80" cy="176" rx="60" ry="14" stroke-opacity=".16"/></g>' +
        '<path d="M0 206C60 198 140 204 200 196V240H0Z" fill="' + S.h[2] + '"/>'
    }[p];
    return '<svg class="sc" viewBox="0 0 200 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + S.sky[0] + '"/><stop offset="1" stop-color="' + S.sky[1] + '"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + S.sky[0] + '"/><stop offset="1" stop-color="' + S.sky[1] + '"/></linearGradient></defs>' +
      '<rect width="200" height="240" fill="url(#' + id + ')"/>' + orb + land + '</svg>';
  }
  function question(ph) {
    if (!ph.open().length) return "Everything is in. Rest easy.";
    var part = HE.part(HE.hour);
    return part === "morning" ? "Where do you want to start?" : part === "afternoon" ? "Where to next?" : part === "evening" ? "What fits this evening?" : "One last thing before bed?";
  }
  /* the pillar each intent brings forward */
  function best(ph, k) {
    var n = ph.next(), list = k === "calm" ? ["mind"] : k === "fuel" ? ["eat"] : k === "move" ? ["move"] : [];
    if (k === "quick") {
      if (n && FAN.indexOf(n.p) > -1) list.push(n.p);
      list = list.concat(["mind", "eat", "move"]).filter(function (p) { return ph.pillarNext(p); });
      if (!list.length) list = ["mind"];
    }
    return list[0];
  }
  function centre(f) { return f.order[1]; }
  function bring(f, p) { var o = FAN.slice(), i = o.indexOf(p); f.order = [o[(i + 2) % 3], p, o[(i + 1) % 3]]; }

  function pose(el, pos, dx) {
    var P = POSE[pos], z = pos === "c" ? 3 : (dx > 0 ? (pos === "l" ? 2 : 1) : (pos === "r" ? 2 : 1));
    el.style.transform = "translateX(" + (P.x + (dx || 0) * (pos === "c" ? .6 : .3)) + "px) rotate(" + (P.r + (pos === "c" ? (dx || 0) * .03 : 0)) + "deg) scale(" + P.s + ")";
    el.style.zIndex = z;
    el.setAttribute("data-pos", pos);
    el.setAttribute("tabindex", "0");
  }
  function layout(ph, root, dx) {
    var f = ph._f, c = centre(f);
    ["l", "c", "r"].forEach(function (pos, i) { pose(root.querySelector('[data-p="' + f.order[i] + '"]'), pos, dx); });
    root.querySelector("." + X + "st").style.setProperty("--halo", HE.P[c].c);
    root.querySelectorAll("." + X + "dots i").forEach(function (d) { d.classList.toggle("on", d.getAttribute("data-d") === c); d.style.setProperty("--c", HE.P[d.getAttribute("data-d")].c); });
    root.querySelectorAll("[data-p]").forEach(function (el) {
      var p = el.getAttribute("data-p"), on = p === c;
      el.setAttribute("aria-label", HE.P[p].n + ", " + HE.P[p].score + " " + ph.scores[p] + " percent. " + (on ? "Open " + HE.P[p].n : "Bring " + HE.P[p].n + " forward"));
    });
  }

  HE.add({
    id: "fan", name: "Pick a door", rec: false, group: "doors", kind: "Door",
    pitch: "Home asks one open question and offers three doors as soft landscape cards, fanned like a hand of cards. The front card is the pillar that fits the hour, with one line on why it is worth doing now. Chips like Calm or Fuel up let a person answer with how they feel instead of what they must do.",
    how: [
      "A big question by the hour (Where do you want to start?) sits over a fan of Eat, Move and Mind cards, each a soft gradient scene with its score and one line tied to the hour.",
      "The card in front is the pillar with something due now. The other two peek out behind it, slightly turned.",
      "Swipe sideways, or tap a side card, to bring it forward. The cards glide, nothing bounces.",
      "Tap the front card to open that pillar.",
      "The chips under the fan (Quick, Calm, Fuel up, Move a little) bring the best pillar for that feeling to the front."
    ],
    score: [["Three doors at a glance", "m"], ["One tap in", "y"], ["A hook to start", "y"], ["GoodFlip look", "m"], ["Calm", "y"]],
    catch: "Only one door is fully visible, the other two are half hidden, and Measure has no card at all. The landscapes are the most colour on any Home so far, which pushes against white and pillar colour only on what scores.",
    from: "The Where do you feel like going pin (big question, fanned photo cards, mood chips), Calm and Headspace scene cards, and Tide's topic chips.",
    tryit: "Swipe the fan left and right, tap a side card, tap Calm then Fuel up, then tap the front card. Try Night for the moon.",
    effort: "Medium, gesture handling and three drawn scenes",
    draw: function (ph) {
      var f = ph._f || (ph._f = { hour: null, order: null, intent: null });
      if (f.hour !== HE.hour || !f.order) {
        f.hour = HE.hour; f.intent = null;
        var n = ph.next(); bring(f, n && FAN.indexOf(n.p) > -1 ? n.p : (FAN.filter(function (p) { return ph.pillarNext(p); })[0] || "eat"));
      }
      var part = HE.part(HE.hour);
      var cards = FAN.map(function (p) {
        var c = HE.P[p], it = ph.pillarNext(p), due = it && it.at <= HE.hour + .25;
        var tag = it ? (due ? '<span class="' + X + 'gs now">' + SHORT[it.id] + ' now</span>' : '<span class="' + X + 'gs fut">' + SHORT[it.id] + ', ' + HE.clock(it.at) + '</span>') : '<span class="' + X + 'gs fut">All in</span>';
        return '<button class="' + X + 'c" data-p="' + p + '" style="--c:' + c.c + ';--d:' + c.d + '">' + scene(p, part) + '<span class="' + X + 'sh"></span>' +
          '<span class="' + X + 'tp"><span class="' + X + 'gs"><i>' + HE.icon(p, 12, 2.4) + '</i><b>' + ph.scores[p] + '%</b></span>' + tag + '</span>' +
          '<span class="' + X + 'bt"><b>' + c.n + '</b><span>' + (it ? PITCH[it.id] : "All in for now. Open it to see your week.") + '</span></span></button>';
      }).join("");
      ph.slot.innerHTML = '<div class="' + X + 'w"><h3 class="' + X + 'q">' + question(ph) + '</h3>' +
        '<div class="' + X + 'st" role="group" aria-label="Pick a pillar">' + cards + '</div>' +
        '<div class="' + X + 'dots" aria-hidden="true">' + FAN.map(function (p) { return '<i data-d="' + p + '"></i>'; }).join("") + '</div>' +
        '<div class="' + X + 'ch" role="group" aria-label="How do you feel like starting">' + INTENTS.map(function (k) { return '<button class="he-chip" data-i="' + k[0] + '" aria-pressed="' + (f.intent === k[0]) + '">' + k[1] + '</button>'; }).join("") + '</div></div>';
      var root = ph.slot.firstChild, stage = root.querySelector("." + X + "st");
      layout(ph, root, 0);

      /* swipe: the fan follows the finger, then settles on release */
      var x0 = null, dx = 0, moved = false;
      stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; dx = 0; moved = false; });
      stage.addEventListener("pointermove", function (e) {
        if (x0 === null) return; dx = e.clientX - x0;
        if (Math.abs(dx) > 6) { moved = true; stage.classList.add("drag"); layout(ph, root, dx); }
      });
      function end() {
        if (x0 === null) return; x0 = null; stage.classList.remove("drag");
        if (moved && Math.abs(dx) > 40) { f.intent = null; bring(f, dx < 0 ? f.order[2] : f.order[0]); syncChips(); }
        layout(ph, root, 0);
      }
      stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end); stage.addEventListener("pointerleave", end);
      function syncChips() { root.querySelectorAll("[data-i]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-i") === f.intent)); }); }

      root.addEventListener("click", function (e) {
        var card = e.target.closest("[data-p]");
        if (card) {
          if (moved) { moved = false; return; }
          var p = card.getAttribute("data-p");
          if (p === centre(f)) return ph.openPillar(p);
          f.intent = null; bring(f, p); syncChips(); layout(ph, root, 0); return;
        }
        var ch = e.target.closest("[data-i]"); if (!ch) return;
        var k = ch.getAttribute("data-i");
        f.intent = f.intent === k ? null : k; syncChips();
        if (f.intent) { bring(f, best(ph, k)); layout(ph, root, 0); }
      });
      root.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        f.intent = null; bring(f, e.key === "ArrowRight" ? f.order[2] : f.order[0]); syncChips(); layout(ph, root, 0);
        root.querySelector('[data-p="' + centre(f) + '"]').focus();
      });
    }
  });
})();
