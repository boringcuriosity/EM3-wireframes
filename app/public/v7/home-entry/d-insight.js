/* Hook: Start with why. The top of Home is one KAIRA insight, set big like a daily quote. It ties two pillars,
   it changes with the time of day and with whichever pillar is lowest, and its pill names the door it points to.
   Under it, the four doors as soft orbs with their scores; the one the insight points at is lifted and ringed. */
(function () {
  var X = "dinsight-", E = "cubic-bezier(.2,0,0,1)";

  /* two lines per pillar and part of day, each a mechanism that ties it to another pillar. Never a recap. */
  var LINES = {
    move: {
      morning: ["A walk after breakfast helps your muscles pull sugar from the blood for hours, so the meal lands softer.",
                "Ten minutes of movement in the morning lifts your energy more than a second cup of tea, and steadies breakfast."],
      afternoon: ["A 10 minute walk after lunch lowers the sugar rise from it.",
                  "Two minutes on the stairs after a meal helps your muscles use its sugar right away."],
      evening: ["Strength work before dinner gives that meal's sugar somewhere to go: your muscles.",
                "A short walk after dinner lowers the sugar rise and helps you fall asleep sooner."],
      night: ["A slow 10 minute walk after dinner lowers your night sugar and makes sleep come easier.",
              "Gentle stretching before bed relaxes the body, and better sleep steadies tomorrow's sugars."]
    },
    eat: {
      morning: ["Protein at breakfast keeps you full until lunch, so the mid-morning slump stays away.",
                "A steady breakfast gives your morning walk the energy it needs, without a sugar dip after."],
      afternoon: ["Eat the dal and salad first and the roti last. The sugar rise is softer, and so is the sleepy hour after lunch.",
                  "A steady lunch keeps the 4 PM cravings quiet, which makes the evening snack an easy choice."],
      evening: ["A small protein snack now stops the big hunger that makes dinner heavy.",
                "A light snack an hour before your workout gives you the energy to finish it strong."],
      night: ["An earlier, lighter dinner gives your body time to settle sugar before sleep.",
              "A heavy late dinner keeps your body busy all night, so sleep is lighter and morning sugar runs higher."]
    },
    mind: {
      morning: ["Short sleep makes the body less sensitive to insulin, so last night decides how breakfast lands.",
                "Five slow breaths before breakfast calm the stress hormones that push morning sugar up."],
      afternoon: ["Five slow minutes of breathing lowers the stress hormones that push sugar up in the afternoon.",
                  "Stress makes the afternoon snack call louder. A short breathing break quiets it."],
      evening: ["A calm evening lowers cortisol, which helps your body handle the sugar from dinner.",
                "Naming how the day felt makes stress easier to spot before it shows up in your sugars."],
      night: ["Screen light delays your sleep hormone, so the phone away now means easier sleep and steadier sugar tomorrow.",
              "Sleep is when the body resets its insulin sensitivity, so a steady bedtime makes tomorrow's meals land softer."]
    }
  };

  var css = [
    "." + X + "w{display:flex;flex-direction:column;gap:20px}",
    /* the insight: no box, set like a daily quote, a soft orb of the pointed pillar behind its corner */
    "." + X + "q{position:relative;padding:4px 4px 0}",
    "." + X + "art{position:absolute;right:-20px;top:-6px;width:116px;height:116px;border-radius:50%;pointer-events:none;" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:inset 0 -18px 28px -16px color-mix(in srgb,var(--c) 55%,transparent),inset 0 9px 15px -8px #fff;opacity:.55;filter:blur(.5px);transition:opacity .6s " + E + "}",
    "." + X + "art::after{content:'';position:absolute;top:12%;left:18%;width:32%;height:22%;border-radius:50%;background:#fff;filter:blur(8px);opacity:.9}",
    "." + X + "k{position:relative;display:flex;align-items:center;gap:8px;font:700 12px/16px Roboto;letter-spacing:.6px;color:#101828}",
    "." + X + "k span{font-weight:500;letter-spacing:0;color:#667085}",
    "." + X + "tx{position:relative;display:grid;margin-top:12px;min-height:144px;align-content:start}",
    "." + X + "tx>div{grid-area:1/1;transition:opacity .45s " + E + ",transform .55s " + E + "}",
    "." + X + "tx>div.off{opacity:0;transform:translateY(6px);pointer-events:none}",
    "." + X + "tx p{margin:0;font:400 21px/29px Roboto;color:#101828;letter-spacing:-.2px;text-wrap:pretty}",
    "." + X + "tx small{display:block;margin-top:8px;font:400 14px/20px Roboto;color:#667085}",
    "." + X + "tx small b{font-weight:600;color:var(--d)}",
    "." + X + "act{position:relative;display:flex;align-items:center;gap:12px;margin-top:20px}",
    "." + X + "go{height:44px;padding:0 18px 0 20px;border:0;border-radius:999px;background:#299D6B;color:#fff;font:700 15px/1 Roboto;display:inline-flex;align-items:center;gap:8px;cursor:pointer;box-shadow:0 4px 0 #2A805A;transition:transform .2s ease-out,box-shadow .2s ease-out}",
    "." + X + "go:active{transform:translateY(4px);box-shadow:none}",
    "." + X + "more{height:44px;padding:0 6px;border:0;background:none;font:500 14px/1 Roboto;color:#667085;cursor:pointer;display:inline-flex;align-items:center;gap:6px}",
    "." + X + "more:active{color:#344054}",
    /* the doors: four soft orbs with their scores, the pointed one lifted and ringed */
    "." + X + "doors{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding-top:4px;border-top:1px solid #F2F4F7}",
    "." + X + "door{border:0;background:none;padding:12px 0 4px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;font-family:Roboto;border-radius:16px}",
    "." + X + "door:focus-visible{outline:2px solid var(--c);outline-offset:-2px}",
    "." + X + "orb{position:relative;width:56px;height:56px;border-radius:50%;overflow:hidden;display:grid;place-items:center;" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 10px 18px -12px color-mix(in srgb,var(--c) 40%,transparent),inset 0 -12px 18px -10px color-mix(in srgb,var(--c) 60%,transparent),inset 0 6px 10px -6px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 12%,transparent);" +
      "transition:transform .5s " + E + ",box-shadow .5s " + E + "}",
    "." + X + "orb::after{content:'';position:absolute;top:10%;left:17%;width:34%;height:23%;border-radius:50%;background:#fff;filter:blur(4px);opacity:.85}",
    "." + X + "orb b{position:relative;z-index:1;font:500 18px/1 'Playfair Display',serif;color:#101828}",
    "." + X + "orb b small{font-size:.55em;color:#667085}",
    "." + X + "nm{display:flex;align-items:center;gap:4px;font:500 12px/16px Roboto;color:#667085;transition:color .4s " + E + "}",
    "." + X + "door.on ." + X + "orb{transform:translateY(-3px);box-shadow:0 0 0 3px #fff,0 0 0 4.5px color-mix(in srgb,var(--c) 55%,transparent),0 14px 22px -10px color-mix(in srgb,var(--c) 50%,transparent),inset 0 -12px 18px -10px color-mix(in srgb,var(--c) 60%,transparent),inset 0 6px 10px -6px #fff}",
    "." + X + "door.on ." + X + "nm{color:var(--d);font-weight:700}",
    "@media (prefers-reduced-motion: reduce){." + X + "tx>div,." + X + "orb{transition:none}}"
  ].join("");
  var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);

  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }
  /* the door to point at: the lowest of Eat, Move and Mind (Measure is a trend, not a gap to close) */
  function lowest(ph) { return ["eat", "move", "mind"].reduce(function (a, b) { return ph.scores[b] < ph.scores[a] ? b : a; }); }
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  HE.add({
    id: "insight", name: "Start with why", rec: false, group: "doors", kind: "Hook",
    pitch: "The hook is a reason, not a task. Home opens on one KAIRA insight, set big like a daily quote, that ties two pillars together and points at the one with the most room right now. Its pill names that door, and the four doors sit as soft orbs underneath with the pointed one lifted.",
    how: [
      "Home opens on one insight for this part of the day, about the pillar that is lowest right now (Move in the morning sample).",
      "The pill names the door it points to, \"Start with Move\", and opens that pillar. The same orb is lifted and ringed below.",
      "\"Another insight\" quietly swaps in a second line for the same door.",
      "Switch the time of day and the insight follows. When scores change and another pillar becomes the lowest, the insight, the pill and the lifted orb move with it."
    ],
    score: [["Three doors at a glance", "y"], ["One tap in", "y"], ["A hook to start", "y"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "It needs a real bank of good insights for every pillar and hour, or it starts to repeat. Pointing at the lowest score can feel like a nudge toward a weak spot on a hard day.",
    from: "Tide's daily quote with its soft orb, Oura's Readiness message, Headspace's Today line, Apple Fitness+ editorial cards.",
    tryit: "Tap Start with Move, then go back. Tap Another insight. Switch to Evening.",
    effort: "Low for the layout, Medium for the insight bank.",
    draw: function (ph) {
      var I = ph._i || (ph._i = { k: 0, key: "" });
      var p = lowest(ph), part = HE.part(HE.hour), key = p + part, c = HE.P[p], two = LINES[p][part];
      if (I.key !== key) { I.key = key; I.k = 0; }
      var when = DAYS[new Date().getDay()] + " " + part;

      var w = document.createElement("div"); w.className = X + "w";
      w.innerHTML =
        '<div class="' + X + 'q" style="' + vars(p) + '">' +
          '<div class="' + X + 'art" aria-hidden="true"></div>' +
          '<div class="' + X + 'k">' + HE.kaira(18) + 'KAIRA<span>' + when + '</span></div>' +
          '<div class="' + X + 'tx" aria-live="polite">' + two.map(function (t, i) {
            return '<div class="' + (i === I.k ? "" : "off") + '"' + (i === I.k ? "" : ' aria-hidden="true"') + '><p>' + t + '</p><small>Your <b>' + c.score + '</b> is lowest right now.</small></div>'; }).join("") + '</div>' +
          '<div class="' + X + 'act"><button class="' + X + 'go" data-open="' + p + '">Start with ' + c.n + HE.icon("arrow", 16, 2.4) + '</button>' +
            '<button class="' + X + 'more">Another insight</button></div>' +
        '</div>' +
        '<div class="' + X + 'doors">' + HE.ORDER.map(function (q) {
          var cq = HE.P[q];
          return '<button class="' + X + 'door' + (q === p ? " on" : "") + '" data-open="' + q + '" style="' + vars(q) + '" aria-label="Open ' + cq.n + ', ' + cq.score + ' ' + ph.scores[q] + ' percent">' +
            '<span class="' + X + 'orb"><b>' + ph.scores[q] + '<small>%</small></b></span><span class="' + X + 'nm">' + HE.icon(q, 13, 2.2) + cq.n + '</span></button>';
        }).join("") + '</div>';
      ph.slot.appendChild(w);

      w.addEventListener("click", function (e) {
        if (e.target.closest("." + X + "more")) {
          I.k = (I.k + 1) % two.length;
          [].forEach.call(w.querySelectorAll("." + X + "tx>div"), function (d, i) { d.classList.toggle("off", i !== I.k); d.setAttribute("aria-hidden", i !== I.k); });
          return;
        }
        var o = e.target.closest("[data-open]"); if (o) ph.openPillar(o.dataset.open);
      });
    }
  });
})();
