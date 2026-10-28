/* KAIRA analysis: the sheet behind Learn more under the Momentum score.
   KAIRA writes markdown only (v7/momentum-ai-prompt.txt): a bold opening, a short paragraph, "What helps next"
   with "- " points, a closing line. This draws it for reading: the opening as a title, points behind GoodFlip's
   green arrow disc, a gain as a green tag, a score range in bold. House sheet rules: title top left, circle X
   top right, no handle, 90% at most, Got it at the foot.

     KairaSheet.html(md)          the note alone, for a page that lays it out itself
     KairaSheet.open(md, extra)   the sheet; extra is html added under the note
   In the Move app, Learn more opens it with the note for this case (v7/data/momentum-ai-samples.json, by ?day=&now=),
   else the plain answer KAIRA would give in chat (say-kaira.js). */
(function () {
  if (window.KairaSheet) return;
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="12" fill="#299D6B"/><path d="M12.8449 6.80593C12.6449 6.61547 12.3284 6.62316 12.138 6.82312C11.9475 7.02307 11.9552 7.33955 12.1551 7.53001L16.3228 11.4998H6.5C6.22386 11.4998 6 11.7236 6 11.9998C6 12.2759 6.22386 12.4998 6.5 12.4998H16.3228L12.1551 16.4696C11.9552 16.66 11.9475 16.9765 12.138 17.1765C12.3284 17.3764 12.6449 17.3841 12.8449 17.1936L17.7908 12.4825C17.9034 12.3752 17.9701 12.2384 17.9907 12.0962C17.9968 12.065 18 12.0327 18 11.9998C18 11.9667 17.9968 11.9344 17.9907 11.9032C17.97 11.761 17.9034 11.6243 17.7908 11.5171L12.8449 6.80593Z" fill="#fff"/></svg>';
  var X = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l8 8M10 2 2 10"/></svg>';
  var CSS = [
    ".ksh{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-end;justify-content:center;background:rgba(16,24,40,0);transition:background .25s ease-out;pointer-events:none}",
    ".ksh.on{background:rgba(16,24,40,.45);pointer-events:auto}",
    ".ksh .kbox{width:100%;max-width:390px;max-height:90vh;display:flex;flex-direction:column;background:#fff;border-radius:24px 24px 0 0;transform:translateY(100%);transition:transform .32s cubic-bezier(.2,0,0,1)}",
    ".ksh.on .kbox{transform:none}",
    ".khd{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 4px}",
    ".khd h4{display:flex;align-items:center;gap:8px;margin:0;font:600 18px/24px Roboto,system-ui,sans-serif;color:#101828}",
    ".khd .kx{width:28px;height:28px;border:0;border-radius:50%;background:#F2F4F7;color:#475467;display:grid;place-items:center;cursor:pointer}",
    ".khd .kx svg{width:12px;height:12px}",
    ".kbd{overflow-y:auto;padding:12px 20px 8px}",
    ".kft{padding:12px 20px calc(20px + env(safe-area-inset-bottom));border-top:1px solid #F2F4F7}",
    ".kft button{width:100%;height:48px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:600 16px Roboto,system-ui,sans-serif;cursor:pointer}",
    /* the note: one rhythm of 12px between blocks */
    ".kmd{font:400 15px/23px Roboto,system-ui,sans-serif;color:#344054}",
    ".kmd>*{margin:0 0 12px}",
    ".kmd b{font-weight:600;color:#101828}",
    ".kmd .kt{font:600 18px/26px Roboto,system-ui,sans-serif;color:#101828;margin-bottom:6px}",
    ".kmd .kl{font:600 12px/16px Roboto,system-ui,sans-serif;letter-spacing:.4px;text-transform:uppercase;color:#667085;margin:18px 0 8px}",
    ".kmd ul{list-style:none;padding:4px 14px;border-radius:14px;background:#F6FAF8;border:1px solid #E3F1EA}",
    ".kmd li{display:grid;grid-template-columns:20px 1fr;gap:10px;align-items:start;padding:10px 0}",
    ".kmd li+li{border-top:1px solid #E3F1EA}",
    ".kmd li svg{width:20px;height:20px;margin-top:2px}",
    ".kmd .tg{display:inline-block;padding:0 6px;border-radius:6px;background:#ECFDF3;color:#067647;font-weight:600;font-size:.93em;line-height:1.55}",
    ".kmd .kc{color:#475467}"
  ].join("");
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };
  var inline = function (t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(<b>)?\+(\d+)%(<\/b>)?/g, '<span class="tg">+$2%</span>');   /* a gain, bold or not, as a green tag */
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
          var li = "<li>" + ARROW + "<span>" + inline(l.slice(2)) + "</span></li>";
          if (out.length && /<\/ul>$/.test(out[out.length - 1])) out[out.length - 1] = out[out.length - 1].replace(/<\/ul>$/, li + "</ul>");
          else out.push("<ul>" + li + "</ul>");
        } else if (only && first) { flush(); out.push('<p class="kt">' + esc(only[1]) + "</p>"); }
        else if (only && /next|helps/i.test(only[1])) { flush(); out.push('<p class="kl">' + esc(only[1]) + "</p>"); }
        else para.push(l);
        first = false;
      });
      flush();
    });
    /* the closing thought, when the note ends on a plain paragraph after the points, reads quieter */
    if (out.length > 2 && /^<p>/.test(out[out.length - 1]) && /<\/ul>$/.test(out[out.length - 2])) out[out.length - 1] = out[out.length - 1].replace("<p>", '<p class="kc">');
    return '<div class="kmd">' + out.join("") + "</div>";
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
    host.innerHTML = '<div class="kbox"><div class="khd"><h4 id="kshT">' + mark + 'KAIRA analysis</h4><button class="kx" data-k="close" aria-label="Close">' + X + "</button></div>" +
      '<div class="kbd">' + html(md) + (extra || "") + '</div><div class="kft"><button data-k="close">Got it</button></div></div>';
    void host.offsetWidth; requestAnimationFrame(function () { host.classList.add("on"); });
  }
  function close() { if (host) host.classList.remove("on"); }
  window.KairaSheet = { html: html, open: open, close: close };

  /* the Move app: Learn more opens this sheet. A page that frames the app (momentum-commentary.html) may set its own SAY_OPEN */
  if (!/\/move\//.test(location.pathname)) return;
  var NOTES = null, Q = new URLSearchParams(location.search);
  var mine = function () {
    if (!NOTES) return null;
    for (var k in NOTES) {
      var c = NOTES[k], p = new URLSearchParams(c.q), ok = true;
      p.forEach(function (v, key) { if (Q.get(key) !== v) ok = false; });
      if (ok) return c;
    }
    return null;
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
