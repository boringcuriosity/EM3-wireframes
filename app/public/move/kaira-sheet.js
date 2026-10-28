/* KAIRA analysis: the sheet behind Learn more under the Momentum score.
   KAIRA writes markdown only (v7/momentum-ai-prompt.txt): a bold opening, a short paragraph, "What helps next"
   with "- " points, a closing line. This draws it for reading: the opening as a title, points on KAIRA's
   gold turn-arrow, a gain as a green tag, a score range in bold. House sheet rules: title top left, circle X
   top right, no handle, 90% at most, Got it at the foot.

     KairaSheet.html(md)          the note alone, for a page that lays it out itself
     KairaSheet.open(md, extra)   the sheet; extra is html added under the note
   In the Move app, Learn more opens it with the note for this case (v7/data/momentum-ai-samples.json, by ?day=&now=),
   else the plain answer KAIRA would give in chat (say-kaira.js). */
(function () {
  if (window.KairaSheet) return;
  var X = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l8 8M10 2 2 10"/></svg>';
  var CSS = [
    ".ksh{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-end;justify-content:center;background:rgba(16,24,40,0);transition:background .25s ease-out;pointer-events:none}",
    ".ksh.on{background:rgba(16,24,40,.45);pointer-events:auto}",
    /* the app's own sheet (plan-tray.js .pts): 16px sides, 20px top, title 800 20/28, a 32px circle X, no divider */
    ".ksh .kshbox{width:100%;max-width:390px;max-height:90vh;display:flex;flex-direction:column;background:#fff;border-radius:20px 20px 0 0;transform:translateY(100%);transition:transform .3s cubic-bezier(.2,0,0,1)}",
    ".ksh.on .kshbox{transform:none}",
    ".ksh-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 16px 0}",
    ".ksh-hd h4{display:flex;align-items:center;gap:8px;margin:0;font:800 20px/28px Roboto,system-ui,sans-serif;color:#101828}",
    ".ksh-hd .ksh-x{width:32px;height:32px;border:0;border-radius:50%;background:#F2F4F7;color:#344054;display:grid;place-items:center;cursor:pointer;flex-shrink:0}",
    ".ksh-hd .ksh-x svg{width:12px;height:12px}",
    ".ksh-bd{overflow-y:auto;padding:16px 16px 4px}",
    ".ksh-ft{padding:12px 16px calc(20px + var(--gf-home-h,20px) + env(safe-area-inset-bottom,0px))}",
    /* the house primary button: green, 52 tall, the darker depth bar under it that it presses into */
    ".ksh-ft button{width:100%;height:52px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:700 15px/1 Roboto,system-ui,sans-serif;box-shadow:0 7px 0 #2A805A;cursor:pointer;transition:transform .2s ease-out,box-shadow .2s ease-out}",
    ".ksh-ft button:active{transform:translateY(7px);box-shadow:none}",
    /* while KAIRA writes: the note's own shape in grey, a light sweep across it, then the words fade in */
    "@keyframes kshim{from{background-position:150% 0}to{background-position:-50% 0}}",
    ".ksh-sk i{display:block;height:14px;margin:0 0 10px;border-radius:7px;background:linear-gradient(90deg,#F2F4F7 30%,#E4E7EC 50%,#F2F4F7 70%) 0 0/200% 100%;animation:kshim 1.2s linear infinite}",
    ".ksh-sk i.t{height:22px;width:62%;margin-bottom:16px}.ksh-sk i.s{width:84%}.ksh-sk i.l{width:28%;height:12px;margin:20px 0 12px}.ksh-sk i.p{width:76%}.ksh-sk i.q{width:58%}",
    ".ksh-sk em{display:flex;align-items:center;gap:6px;margin-top:18px;font:500 13px/18px Roboto,system-ui,sans-serif;font-style:normal;color:#667085}",
    "@keyframes kin{from{opacity:0;transform:translateY(6px)}}",
    ".ksh-md.ksh-in{animation:kin .36s cubic-bezier(.2,0,0,1) both}",
    "@media (prefers-reduced-motion:reduce){.ksh-sk i{animation:none}.ksh-md.ksh-in{animation:none}.ksh .kshbox{transition:none}}",
    /* the note: one rhythm of 12px between blocks */
    ".ksh-md{font:400 15px/23px Roboto,system-ui,sans-serif;color:#344054}",
    ".ksh-md>*{margin:0 0 12px}",
    ".ksh-md b{font-weight:600;color:#101828}",
    ".ksh-md .ksh-t{font:600 18px/26px Roboto,system-ui,sans-serif;color:#101828;margin-bottom:6px}",
    ".ksh-md .ksh-l{font:600 12px/16px Roboto,system-ui,sans-serif;letter-spacing:.4px;text-transform:uppercase;color:#667085;margin:18px 0 8px}",
    /* points on KAIRA's gold turn-arrow, as the Move sufficiency sheet's reasons (assets/trend-bullet.svg); no box */
    ".ksh-md ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px}",
    ".ksh-md li{position:relative;padding-left:24px}",
    ".ksh-md li b{white-space:nowrap}",
    ".ksh-md li::before{content:'';position:absolute;left:0;top:3.5px;width:16px;height:16px;background:url(/v7/r3/assets/trend-bullet.svg) no-repeat center/16px}",
    ".ksh-md .ksh-g{display:inline-block;padding:0 6px;border-radius:6px;background:#ECFDF3;color:#067647;font-weight:600;font-size:.93em;line-height:1.55}",
    ".ksh-md .ksh-c{color:#475467}"
  ].join("");
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };
  var inline = function (t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(<b>)?\+(\d+)%(<\/b>)?/g, '<span class="ksh-g">+$2%</span>');   /* a gain, bold or not, as a green tag */
  };
  /* markdown, the little KAIRA uses: paragraphs, line breaks, **bold**, "- " points */
  function html(md) {
    var blocks = String(md || "").trim().split(/\n\s*\n/), out = [], first = true;
    blocks.forEach(function (b) {
      var lines = b.split("\n").map(function (l) { return l.trim(); }).filter(Boolean), para = [];
      var flush = function () { if (para.length) { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } };
      lines.forEach(function (l) {
        var only = /^\*\*([^*]+)\*\*$/.exec(l);
        if (/^- /.test(l)) {
          flush();
          var li = "<li>" + inline(l.slice(2)) + "</li>";
          if (out.length && /<\/ul>$/.test(out[out.length - 1])) out[out.length - 1] = out[out.length - 1].replace(/<\/ul>$/, li + "</ul>");
          else out.push("<ul>" + li + "</ul>");
        } else if (only && first) { flush(); out.push('<p class="ksh-t">' + esc(only[1]) + "</p>"); }
        else if (only && /next|helps/i.test(only[1])) { flush(); out.push('<p class="ksh-l">' + esc(only[1]) + "</p>"); }
        else para.push(l);
        first = false;
      });
      flush();
    });
    /* the closing thought, when the note ends on a plain paragraph after the points, reads quieter */
    if (out.length > 2 && /^<p>/.test(out[out.length - 1]) && /<\/ul>$/.test(out[out.length - 2])) out[out.length - 1] = out[out.length - 1].replace("<p>", '<p class="ksh-c">');
    return '<div class="ksh-md">' + out.join("") + "</div>";
  }

  var host;
  function open(md, extra) {
    if (!host) {
      host = document.createElement("div"); host.className = "ksh"; host.setAttribute("role", "dialog"); host.setAttribute("aria-modal", "true");
      host.setAttribute("aria-labelledby", "kshT");
      document.body.appendChild(host);
      host.addEventListener("click", function (e) { if (e.target === host || e.target.closest("[data-k=close]")) close(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    }
    var mark = window.GFKaira ? window.GFKaira.mark(24, { halo: false }) : "";
    var sk = '<div class="ksh-sk" aria-live="polite"><i class="t"></i><i></i><i class="s"></i><i class="q"></i><i class="l"></i><i class="p"></i><i class="q"></i>' +
      "<em>" + (window.GFKaira ? window.GFKaira.mark(14, { halo: false }) : "") + "KAIRA is looking at your day…</em></div>";
    host.innerHTML = '<div class="kshbox"><div class="ksh-hd"><h4 id="kshT">' + mark + 'KAIRA analysis</h4><button class="ksh-x" data-k="close" aria-label="Close">' + X + "</button></div>" +
      '<div class="ksh-bd">' + sk + '</div><div class="ksh-ft"><button data-k="close">Got it</button></div></div>';
    void host.offsetWidth; requestAnimationFrame(function () { host.classList.add("on"); });
    /* ponytail: the note is ready at once in the prototype; the shimmer stands in for the AI call (about 1.4 s), the live app shows it until the reply lands */
    clearTimeout(host._t);
    host._t = setTimeout(function () {
      var bd = host.querySelector(".ksh-bd"); if (!bd) return;
      bd.innerHTML = html(md).replace('class="ksh-md"', 'class="ksh-md ksh-in"') + (extra || "");
    }, 1400);
  }
  function close() { if (host) host.classList.remove("on"); }
  window.KairaSheet = { html: html, open: open, close: close };

  /* the Move app: Learn more opens this sheet. A page that frames the app (momentum-commentary.html) may set its own SAY_OPEN */
  if (!/\/move\//.test(location.pathname)) return;
  var NOTES = null, Q = new URLSearchParams(location.search);
  var mine = function () {
    if (!NOTES) return null;
    /* the case whose flags all match this screen; the most specific wins (now=15 is inside day=tick&now=15) */
    var best = null, most = -1;
    for (var k in NOTES) {
      var c = NOTES[k], p = new URLSearchParams(c.q), ok = true, n = 0;
      p.forEach(function (v, key) { n++; if (Q.get(key) !== v) ok = false; });
      if (ok && n > most) { best = c; most = n; }
    }
    return best;
  };
  fetch("/v7/data/momentum-ai-samples.json").then(function (r) { return r.json(); }).then(function (d) {
    NOTES = d;
    /* &note=1 (move-momentum.html): the case's card line under the score, as it reads right after that log */
    var c = Q.get("note") && mine();
    if (c) setTimeout(function () {
      var cm = document.getElementById("cm");
      if (cm && window.GFSay && window.GFSay.show) { cm.classList.add("said"); window.GFSay.show(c.line); }
    }, 1800);
  }).catch(function () {});
  window.SAY_OPEN = window.SAY_OPEN || function (s) {
    var c = mine();
    if (c && c.text) return open(c.text);
    if (c && c.fallback && c.template) return open(c.template);
    /* no note for this case: the answer KAIRA would give in chat, as plain paragraphs */
    var a = s && s.ask && s.ask.a;
    open(a ? String(a).replace(/<[^>]+>/g, "") : "**Your Momentum**\n\nKeep logging your movement to see your score grow.");
  };
})();
