/* Door: Pillar stack. One big number for the metabolic day, a split legend under it, and the four pillars as a
   stack of rounded tiles like app icons. Tap the stack and it fans out into four doors side by side; tap a door
   and its pillar opens; tap anywhere else and the fan closes. Today / Week swaps the number with a smooth count. */
(function () {
  var X = "dstack-", E = "cubic-bezier(.2,0,0,1)", E2 = "cubic-bezier(.4,0,.2,1)", T = ".55s " + E;
  var THREE = ["eat", "move", "mind"], DAYS = "SMTWTFS";
  var css = [
    "." + X + "eb{display:block;font:500 13px/18px Roboto;color:#667085}",
    "." + X + "num{display:flex;align-items:baseline;gap:2px;margin:2px 0 6px}",
    "." + X + "big{font:500 56px/60px 'Playfair Display',serif;letter-spacing:-1px;color:#101828;font-variant-numeric:lining-nums tabular-nums}",
    "." + X + "pc{font:500 22px/1 Roboto;color:#98A2B3}",
    "." + X + "lg{display:flex;gap:14px;font:400 12.5px/16px Roboto;color:#667085}",
    "." + X + "lg span{display:inline-flex;align-items:center;gap:6px}",
    "." + X + "lg i{width:7px;height:7px;border-radius:50%}",
    "." + X + "lg b{font-weight:700;color:#101828;font-variant-numeric:tabular-nums}",
    /* the card holding the stack */
    "." + X + "card{margin:16px 0 0;padding:14px 16px 16px;border-radius:24px;border:1px solid #F2F4F7;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.04),0 14px 24px -18px rgba(16,24,40,.2)}",
    "." + X + "hd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}",
    "." + X + "hd b{font:600 14px/20px Roboto;color:#101828}",
    "." + X + "hd small{font:400 12px/16px Roboto;color:#98A2B3;transition:opacity .3s " + E + "}",
    "." + X + "stk{position:relative;height:80px;transition:height " + T + "}",
    "." + X + "stk.open{height:116px}",
    "." + X + "t{position:absolute;padding:0;border:0;border-radius:20px;cursor:pointer;color:var(--d);font-family:Roboto;" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 12px 20px -12px color-mix(in srgb,var(--c) 60%,transparent),inset 0 -12px 18px -12px color-mix(in srgb,var(--c) 60%,transparent),inset 0 8px 12px -8px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 14%,transparent),0 0 0 2px #fff;" +
      "transition:left " + T + ",top " + T + ",width " + T + ",height " + T + ",transform " + T + ",border-radius " + T + ";transition-delay:var(--dl)}",
    "." + X + "t:focus-visible{outline:2px solid var(--c);outline-offset:3px}",
    "." + X + "gl{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);transition:top " + T + ";transition-delay:var(--dl)}",
    "." + X + "stk.open ." + X + "gl{top:32px}",
    "." + X + "tx{position:absolute;left:0;right:0;bottom:12px;display:flex;flex-direction:column;align-items:center;gap:2px;opacity:0;transform:translateY(4px);transition:opacity .25s " + E + ",transform .25s " + E + "}",
    "." + X + "stk.open ." + X + "tx{opacity:1;transform:none;transition:opacity .35s " + E + " .25s,transform .35s " + E + " .25s}",
    "." + X + "tx b{font:600 12px/16px Roboto;color:#101828}",
    "." + X + "tx em{font:500 15px/18px 'Playfair Display',serif;font-style:normal;color:#101828}",
    "." + X + "dot{position:absolute;left:8px;top:8px;width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 0 2px #fff}",
    "." + X + "cover{position:absolute;inset:0;border:0;background:none;cursor:pointer;z-index:9;border-radius:20px}",
    "." + X + "cover:focus-visible{outline:2px solid #299D6B;outline-offset:3px}",
    "." + X + "stk.open ." + X + "cover{display:none}",
    /* Today / Week and the week's line */
    "." + X + "seg{position:relative;display:inline-flex;margin:16px 0 0;padding:3px;border-radius:999px;background:#F2F4F7}",
    "." + X + "seg button{position:relative;z-index:1;width:76px;height:34px;border:0;background:none;border-radius:999px;font:600 13px/1 Roboto;color:#667085;cursor:pointer;transition:color .3s " + E + "}",
    "." + X + "seg button.on{color:#101828}",
    "." + X + "seg i{position:absolute;left:3px;top:3px;width:76px;height:34px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(16,24,40,.1);transition:transform .4s " + E + "}",
    "." + X + "seg.wk i{transform:translateX(76px)}",
    "." + X + "ch{margin:12px 0 0}",
    "." + X + "ch svg{display:block;overflow:visible}",
    "." + X + "avg,." + X + "td{transition:opacity .4s " + E + "}",
    "@media (prefers-reduced-motion: reduce){." + X + "t,." + X + "gl,." + X + "stk,." + X + "tx,." + X + "seg i{transition:none!important}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }
  /* the day's number is the mean of the three scores; the week's is the mean of seven of those days, today live */
  function day(ph, i) { return THREE.reduce(function (s, p) { return s + (i === 6 ? ph.scores[p] : HE.WEEK[p][i]); }, 0) / 3; }
  function vals(ph, wk) {
    var o = {};
    THREE.forEach(function (p) { o[p] = wk ? HE.WEEK[p].slice(0, 6).concat(ph.scores[p]).reduce(function (a, b) { return a + b; }, 0) / 7 : ph.scores[p]; });
    o.all = wk ? [0, 1, 2, 3, 4, 5, 6].reduce(function (s, i) { return s + day(ph, i); }, 0) / 7 : day(ph, 6);
    return o;
  }

  /* where each tile sits: stacked like app icons, or fanned into four doors */
  var W = 296, SZ = 64, STEP = 40, ROT = [-8, -3, 3, 8];
  function place(el, i, open) {
    var dw = (W - 24) / 4;
    if (open) { el.style.left = (i * (dw + 8)) + "px"; el.style.top = "0px"; el.style.width = dw + "px"; el.style.height = "116px"; el.style.transform = "none"; }
    else { el.style.left = ((W - SZ - 3 * STEP) / 2 + i * STEP) + "px"; el.style.top = "8px"; el.style.width = SZ + "px"; el.style.height = SZ + "px"; el.style.transform = "rotate(" + ROT[i] + "deg)"; }
  }
  function setOpen(ph, open) {
    ph._s.open = open;
    var stk = ph.slot.querySelector("." + X + "stk"); if (!stk) return;
    stk.classList.toggle("open", open);
    stk.querySelectorAll("." + X + "t").forEach(function (t, i) { t.style.setProperty("--dl", (open ? i : 3 - i) * 30 + "ms"); place(t, i, open); t.tabIndex = open ? 0 : -1; });
    ph.slot.querySelector("." + X + "hd small").textContent = open ? "Tap a door to open it" : "Tap to open";
  }

  /* the number counts to its new value, eased, never past it */
  function count(ph, to) {
    var s = ph._s, from = s.shown || to, t0 = performance.now(), D = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700;
    cancelAnimationFrame(s.raf);
    var nodes = { all: ph.slot.querySelector("." + X + "big") };
    THREE.forEach(function (p) { nodes[p] = ph.slot.querySelector('[data-v="' + p + '"]'); });
    (function f(now) {
      var k = D ? Math.min(1, (now - t0) / D) : 1, e = 1 - Math.pow(1 - k, 3), cur = {};
      Object.keys(nodes).forEach(function (key) { cur[key] = from[key] + (to[key] - from[key]) * e; nodes[key].textContent = Math.round(cur[key]); });
      s.shown = cur;
      if (k < 1) s.raf = requestAnimationFrame(f);
    })(t0);
  }

  function chart(ph, wk) {
    var pts = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return day(ph, i); }), avg = vals(ph, true).all;
    var x = function (i) { return 8 + i * 52; }, y = function (v) { return 4 + (80 - v) / 60 * 44; };
    var d = pts.map(function (v, i) { return (i ? "L" : "M") + x(i) + " " + y(v).toFixed(1); }).join("");
    return '<svg width="328" height="70" viewBox="0 0 328 70" aria-hidden="true"><defs><linearGradient id="' + X + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#299D6B" stop-opacity=".16"/><stop offset="1" stop-color="#299D6B" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + d + 'L' + x(6) + ' 52L8 52Z" fill="url(#' + X + 'g)"/><path d="' + d + '" fill="none" stroke="#299D6B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<line class="' + X + 'avg" x1="8" x2="320" y1="' + y(avg).toFixed(1) + '" y2="' + y(avg).toFixed(1) + '" stroke="#98A2B3" stroke-width="1" stroke-dasharray="3 4" opacity="' + (wk ? 1 : 0) + '"/>' +
      pts.map(function (v, i) { return '<circle' + (i === 6 ? ' class="' + X + 'td"' : "") + ' cx="' + x(i) + '" cy="' + y(v).toFixed(1) + '" r="' + (i === 6 ? 5 : 2.5) + '" fill="' + (i === 6 ? "#299D6B" : "#fff") + '" stroke="#299D6B" stroke-width="2"' + (i === 6 ? ' opacity="' + (wk ? .5 : 1) + '"' : "") + '/>'; }).join("") +
      [0, 1, 2, 3, 4, 5, 6].map(function (i) { var dd = (new Date().getDay() - 6 + i + 7) % 7; return '<text x="' + x(i) + '" y="68" text-anchor="middle" font-family="Roboto" font-size="11" font-weight="' + (i === 6 ? 700 : 500) + '" fill="' + (i === 6 ? "#101828" : "#98A2B3") + '">' + DAYS[dd] + '</text>'; }).join("") + '</svg>';
  }

  HE.add({
    id: "stack", name: "Pillar stack", rec: false, group: "doors", kind: "Door",
    pitch: "One number says how the metabolic day is going, with a small split under it. The four pillars sit below as a neat stack of tiles, like app icons. One tap fans them out into four doors side by side, and a second tap walks through one.",
    how: [
      "The top reads in a second: the day's number, and the three scores that make it.",
      "The pillars rest as a stack of four rounded tiles. The pillar with something due now carries a small dot.",
      "Tap the stack and it fans out into four doors with their names and scores. Tap a door to open its pillar. Tap anywhere else to fold it back.",
      "Today and Week swap the big number between now and the week's average. The digits count to the new value and the line under shows the week."
    ],
    score: [["Three doors at a glance", "m"], ["One tap in", "m"], ["A hook to start", "m"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "Opening a pillar takes two taps, one to fan and one to choose, and the folded stack hides the names. The hook is the number, which shows how the day is going but does not say what to do next.",
    from: "The spending app pin (one big number, a stack of app tiles, filter chips and a chart), iOS folder previews, Apple Wallet's card stack.",
    tryit: "Tap the stack, then a door. Tap outside to fold it. Switch Today and Week to watch the number count.",
    effort: "Medium, the fan motion and a weekly average on existing scores",
    draw: function (ph) {
      var s = ph._s = ph._s || { open: false, wk: false, shown: null };
      var v = vals(ph, s.wk), due = (ph.next() && ph.next().at <= HE.hour + .25) ? ph.next().p : null;
      ph.slot.innerHTML =
        '<span class="' + X + 'eb">' + (s.wk ? "Your metabolic week, on average" : "Your metabolic day") + '</span>' +
        '<div class="' + X + 'num"><span class="' + X + 'big">' + Math.round(v.all) + '</span><span class="' + X + 'pc">%</span></div>' +
        '<div class="' + X + 'lg">' + THREE.map(function (p) { return '<span><i style="background:' + HE.P[p].c + '"></i>' + HE.P[p].n + ' <b data-v="' + p + '">' + Math.round(v[p]) + '</b></span>'; }).join("") + '</div>' +
        '<div class="' + X + 'card"><div class="' + X + 'hd"><b>Your pillars</b><small></small></div><div class="' + X + 'stk">' +
          HE.ORDER.map(function (p, i) {
            var c = HE.P[p];
            return '<button class="' + X + 't" data-p="' + p + '" style="' + vars(p) + ';z-index:' + (i + 1) + '" aria-label="Open ' + c.n + ', ' + c.score + ' ' + ph.scores[p] + ' percent">' +
              '<span class="' + X + 'gl">' + HE.icon(p, 26, 1.9) + '</span><span class="' + X + 'tx"><b>' + c.n + '</b><em>' + ph.scores[p] + '%</em></span>' + (due === p ? '<span class="' + X + 'dot"></span>' : "") + '</button>';
          }).join("") +
          '<button class="' + X + 'cover" aria-label="Show your pillars"></button></div></div>' +
        '<div class="' + X + 'seg' + (s.wk ? " wk" : "") + '" role="tablist"><i></i><button role="tab" data-r="0" class="' + (s.wk ? "" : "on") + '" aria-selected="' + !s.wk + '">Today</button><button role="tab" data-r="1" class="' + (s.wk ? "on" : "") + '" aria-selected="' + s.wk + '">Week</button></div>' +
        '<div class="' + X + 'ch">' + chart(ph, s.wk) + '</div>';
      /* redraws land in the state they were left in, without replaying the fan */
      var stk = ph.slot.querySelector("." + X + "stk");
      stk.querySelectorAll("." + X + "t").forEach(function (t) { t.style.transition = "none"; t.querySelector("." + X + "gl").style.transition = "none"; });
      stk.style.transition = "none"; setOpen(ph, s.open);
      void stk.offsetWidth;
      stk.style.transition = ""; stk.querySelectorAll("." + X + "t").forEach(function (t) { t.style.transition = ""; t.querySelector("." + X + "gl").style.transition = ""; });
      s.shown = v;

      ph.slot.onclick = function (e) {
        if (e.target.closest("." + X + "cover")) return setOpen(ph, true);
        var t = e.target.closest("[data-p]"); if (t && s.open) return ph.openPillar(t.dataset.p);
        var r = e.target.closest("[data-r]"); if (!r) return;
        var wk = r.dataset.r === "1"; if (wk === s.wk) return; s.wk = wk;
        var seg = ph.slot.querySelector("." + X + "seg"); seg.classList.toggle("wk", wk);
        seg.querySelectorAll("button").forEach(function (b) { var on = (b.dataset.r === "1") === wk; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
        ph.slot.querySelector("." + X + "eb").textContent = wk ? "Your metabolic week, on average" : "Your metabolic day";
        ph.slot.querySelector("." + X + "avg").style.opacity = wk ? 1 : 0;
        ph.slot.querySelector("." + X + "td").style.opacity = wk ? .5 : 1;
        count(ph, vals(ph, wk));
      };
      /* a tap anywhere outside the fan folds it back (bound once per phone) */
      if (!s.bound) {
        s.bound = true;
        ph.el.addEventListener("pointerdown", function (e) { if (s.open && !e.target.closest("." + X + "stk")) setOpen(ph, false); });
      }
    }
  });
})();
