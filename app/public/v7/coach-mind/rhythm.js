/* Mind plan, coach portal prototype: the two scored steps of the Rhythm.
   MP.steps.sleep    (prefix sl-): plan name and dates, Sleep (duration and window, one card with a draggable night bar), Wind-down tasks. 70 points.
   MP.steps.selfcare (prefix sc-): Breathing, Me-time, Mood check-in. 30 points.
   What a coach sets in each part follows /mind/sandbox-simple.html, "The coach's plan". Weights come from MP.PARTS and never change here. */
(function () {
  var MP = window.MP, H = MP.helpers, esc = H.esc;

  /* ---------- shared bits ---------- */
  var COL = { in: ["#444CE7", "#EEF4FF"], teal: ["#0E9384", "#F0FDF9"], gold: ["#B54708", "#FFFAEB"], pink: ["#C11574", "#FDF2FA"] };
  var part = function (k) { return MP.PARTS.filter(function (x) { return x.key === k; })[0]; };
  var num = function (v) { return (Math.round(v * 10) / 10).toString(); };
  var mins = function (hm) { return +hm.slice(0, 2) * 60 + +hm.slice(3, 5); };
  var okTime = function (v) { return /^\d\d:\d\d/.test(v || ""); };
  var len = function (m) { var h = Math.floor(m / 60), x = m % 60; return (h ? h + " h" : "") + (h && x ? " " : "") + (x ? x + " min" : "") || "0 min"; };
  var vars = function (colour) { var c = COL[colour]; return "--c:" + c[0] + ";--t:" + c[1]; };

  function css(p) {
    var id = p + "-css"; if (document.getElementById(id)) return;
    var s = [
      ".P-wrap{display:flex;flex-direction:column;gap:16px;font:400 14px/20px Onest,system-ui,sans-serif;color:#475467}",
      ".P-wrap *{box-sizing:border-box}",
      ".P-wrap :focus-visible{outline:2px solid #299D6B;outline-offset:2px}",
      ".P-head h1{margin:0;font:800 24px/32px Montserrat,system-ui,sans-serif;color:#1D4D38}",
      ".P-head p{margin:4px 0 0}",
      ".P-card{background:#fff;border:1px solid #E4E7EC;border-radius:18px;padding:20px 22px;display:flex;flex-direction:column;gap:16px}",
      ".P-ch{display:flex;align-items:center;justify-content:space-between;gap:12px}",
      ".P-ch h3{margin:0;font:800 16px/24px Montserrat,system-ui,sans-serif;color:#1D4D38;display:flex;align-items:center;gap:10px}",
      ".P-dot{width:10px;height:10px;border-radius:3px;background:var(--c);flex:none}",
      ".P-pts{font:700 12px/16px Onest,sans-serif;color:var(--c);background:var(--t);border-radius:999px;padding:4px 10px;white-space:nowrap}",
      ".P-hint{margin:-10px 0 0}",
      ".P-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;align-items:start}",
      ".P-g-plan{grid-template-columns:2fr 1fr 1fr}",
      ".P-addw{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px}",
      ".P-wins{display:flex;flex-direction:column;gap:12px;margin-top:4px}",
      ".P-win{padding:14px 16px 16px;border:1px solid #E4E7EC;border-radius:14px;background:#fff}",
      ".P-winh{display:flex;align-items:center;gap:8px;margin-bottom:10px}.P-winh b{flex:1;font:700 14px Onest,sans-serif;color:#101828}",
      ".P-wn{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#EEF4FF;color:#444CE7;font:700 12px Onest,sans-serif}",
      ".P-g3{grid-template-columns:repeat(3,minmax(0,1fr))}",
      ".P-sum{display:flex;align-items:center;gap:16px;min-height:44px}.P-sum>b{font:700 22px Onest,sans-serif;color:#101828;white-space:nowrap}.P-sum>b small{font-size:14px;font-weight:600;color:#475467;margin-left:2px}",
      ".P-split{flex:1;display:flex;gap:3px;height:28px;max-width:520px}.P-split i{display:flex;align-items:center;min-width:0;padding:0 10px;border-radius:8px;background:#C7D7FE}.P-split i+i{background:#E0EAFF}",
      ".P-split em{font:600 12px Onest,sans-serif;font-style:normal;color:#2D31A6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".P-tot{margin:12px 0 0;font:400 13px/19px Onest,sans-serif;color:#475467}.P-tot b{color:#101828}",
      ".P-tot.bad{display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:12px 14px;border:1px solid #FECDCA;border-radius:12px;background:#FEF3F2;color:#912018}.P-tot.bad b{color:#7A271A}",
      ".P-cw{flex:1 1 320px;display:flex;gap:8px;align-items:flex-start}.P-cw svg{width:16px;height:16px;flex:none;margin-top:2px;color:#D92D20}",
      ".P-merge{height:36px;padding:0 14px;border-radius:11px;border:1px solid #299D6B;background:#fff;color:#1D4D38;font:600 13px Onest,sans-serif;cursor:pointer}.P-merge:hover{background:#F3FCF8}",
      ".P-lens{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}.P-lens .P-lab{margin-right:4px}",
      ".P-len{height:32px;padding:0 14px;border-radius:999px;border:1px solid #E4E7EC;background:#fff;font:600 13px Onest,sans-serif;color:#344054;cursor:pointer}",
      ".P-len:hover{border-color:#299D6B}.P-len[aria-pressed=true]{background:#F3FCF8;border-color:#299D6B;color:#1D4D38}",
      ".P-f{display:flex;flex-direction:column;gap:8px;min-width:0}",
      ".P-lab{font:700 11px/16px Onest,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#475467}",
      ".P-in{height:44px;width:100%;background:#F3FCF8;border:1px solid #E4E7EC;border-radius:11px;padding:0 14px;font:600 14px Onest,sans-serif;color:#101828}",
      ".P-in:focus{outline:none;border-color:#299D6B;box-shadow:0 0 0 3px rgba(41,157,107,.18)}",
      ".P-in::placeholder{color:#98A2B3;font-weight:500}",
      ".P-stp{display:flex;align-items:center;gap:8px;max-width:280px}",
      ".P-sb{width:36px;height:36px;flex:none;border:1px solid #299D6B;border-radius:11px;background:#fff;color:#299D6B;font:600 18px/1 Onest,sans-serif;cursor:pointer;display:grid;place-items:center;padding:0}",
      ".P-sb:hover{background:#F3FCF8}",
      ".P-sb:disabled{border-color:#E4E7EC;color:#D0D5DD;background:#fff;cursor:not-allowed}",
      ".P-sv{flex:1;min-width:84px;height:44px;border-radius:11px;background:#F3FCF8;border:1px solid #E4E7EC;display:flex;align-items:baseline;justify-content:center;font:700 15px/42px Onest,sans-serif;color:#101828}",
      ".P-sv small{font:500 13px Onest,sans-serif;color:#475467;margin-left:3px}",
      ".P-note{font:400 12.5px/18px Onest,sans-serif;color:#667085}",
      ".P-live{padding:10px 14px;border-radius:11px;background:var(--t);color:#344054;font:500 13px/18px Onest,sans-serif}",
      ".P-live b{color:var(--c);font-weight:700}",
      ".P-list{display:flex;flex-direction:column;gap:8px}",
      ".P-row{display:flex;align-items:center;gap:12px;padding:8px 8px 8px 16px;border:1px solid #E4E7EC;border-radius:12px;background:#fff}",
      ".P-rt{flex:1;min-width:0;font:600 14px/20px Onest,sans-serif;color:#101828}",
      ".P-row .P-at{flex:none;width:132px;height:36px;padding:0 10px;font-variant-numeric:tabular-nums}",
      ".P-row .P-in{height:36px}",
      ".P-rt span{display:block;font:400 13px/18px Onest,sans-serif;color:#475467}",
      ".P-x{width:32px;height:32px;flex:none;border-radius:50%;border:0;background:transparent;color:#667085;cursor:pointer;font:400 20px/1 Onest,sans-serif;padding:0}",
      ".P-x:hover{background:#F2F4F7;color:#101828}",
      ".P-empty{padding:16px;border:1px dashed #D0D5DD;border-radius:12px;text-align:center}",
      ".P-sug{display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:1px solid #F2F4F7}",
      ".P-own{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".P-own .P-in{flex:1;min-width:220px}",
      ".P-in:disabled{background:#F9FAFB;color:#98A2B3;cursor:not-allowed}",
      ".P-sel{padding-right:8px;cursor:pointer}",
      ".P-own .P-sel{flex:1 1 300px;min-width:240px}",
      ".P-add{align-items:flex-start}.P-add .P-ftask{flex:1 1 480px;min-width:0}.P-add .P-ftime{flex:none;width:140px}.P-add .P-ftime .P-in{min-width:0;flex:none}.P-add>.P-btn2{height:44px;margin-top:24px}",
      ".P-btn2{height:40px;padding:0 16px;border:1px solid #299D6B;border-radius:11px;background:#fff;color:#299D6B;font:600 13.5px Onest,sans-serif;cursor:pointer;flex:none}",
      ".P-btn2:hover:not(:disabled){background:#F3FCF8}",
      ".P-btn2:disabled{border-color:#E4E7EC;color:#98A2B3;cursor:not-allowed}",
      ".P-msg{width:100%;font:500 12.5px Onest,sans-serif;color:#B42318}",
      ".P-xs{width:32px;flex:none}",
      ".P-merow{padding:6px}.P-merow .P-mein{flex:1;min-width:0;height:36px;background:#fff;border-color:#E4E7EC;padding:0 12px}.P-merow .P-mein:hover{border-color:#D0D5DD}.P-merow .P-mein:focus{border-color:#299D6B}.P-merow [data-meat]{width:116px;flex:none;margin-right:38px}",
      ".P-trow{padding:6px}.P-trow .P-tin{flex:1;min-width:0;height:36px;background:#fff;border-color:#E4E7EC;padding:0 12px;font-weight:600}.P-trow .P-tin:hover{border-color:#D0D5DD}.P-trow .P-tin:focus{border-color:#299D6B}",
      ".P-cbx{position:relative}.P-cbx .P-in{height:44px;padding-left:40px;background:#fff}.P-cbx .P-in:hover{border-color:#D0D5DD}",
      ".P-cbx::before{content:'+';position:absolute;left:15px;top:11px;font:600 20px/20px Onest,sans-serif;color:var(--c);pointer-events:none}",
      ".P-more{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 12px 0 10px;border:1px dashed #D0D5DD;border-radius:10px;background:#fff;color:var(--c);font:600 13.5px Onest,sans-serif;cursor:pointer}",
      ".P-more:hover{border-color:var(--c);background:var(--t)}",
      /* undo toast */
      ".P-toast{position:fixed;left:50%;bottom:96px;transform:translate(-50%,8px);opacity:0;pointer-events:none;z-index:50;display:flex;align-items:center;gap:16px;padding:10px 10px 10px 16px;border-radius:12px;background:#101828;color:#fff;font:500 13.5px/20px Onest,sans-serif;box-shadow:0 8px 24px rgba(16,24,40,.18);transition:opacity .2s ease,transform .2s ease;max-width:calc(100vw - 32px)}",
      ".P-toast.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}",
      ".P-toast button{height:32px;padding:0 12px;border:0;border-radius:8px;background:rgba(255,255,255,.12);color:#6CE9A6;font:600 13px Onest,sans-serif;cursor:pointer}",
      "@media (max-width:900px){.P-g-plan{grid-template-columns:1fr 1fr}.P-g-plan>:first-child{grid-column:1/-1}}"
    ].join("\n").replace(/P-/g, p + "-");
    var st = document.createElement("style"); st.id = id; st.textContent = s + (EXTRA[p] || ""); document.head.appendChild(st);
  }
  var EXTRA = {
    sl: [
      ".sl-night{display:flex;flex-direction:column;gap:10px}",
      ".sl-bar{position:relative;user-select:none;-webkit-user-select:none}",
      ".sl-bar svg{display:block;width:100%;height:auto}",
      /* the drag layer sits over the svg, in % of its viewBox (960 x 86): bar y 34 to 58 */
      ".sl-blk{position:absolute;top:39.53%;height:27.91%;border-radius:8px;cursor:grab;touch-action:none}",
      ".sl-blk:hover{box-shadow:inset 0 0 0 1.5px rgba(68,76,231,.5)}",
      ".sl-blk.is-drag{cursor:grabbing;box-shadow:inset 0 0 0 1.5px #444CE7}",
      ".sl-blk:focus-visible{outline:2px solid #299D6B;outline-offset:2px}",
      ".sl-hd{position:absolute;top:16.28%;height:58.14%;width:28px;margin-left:-14px;cursor:ew-resize;touch-action:none;outline:none}",
      ".sl-grip{position:absolute;left:50%;top:64%;width:10px;height:26px;transform:translate(-50%,-50%);border-radius:5px;background:#fff;border:1.5px solid #101828;box-shadow:0 1px 3px rgba(16,24,40,.18);transition:border-color .15s ease,box-shadow .15s ease}",
      ".sl-hd:hover .sl-grip,.sl-hd.is-drag .sl-grip{border-color:#444CE7}",
      ".sl-wrap .sl-hd:focus-visible{outline:none}",
      ".sl-hd:focus-visible .sl-grip{border-color:#299D6B;box-shadow:0 0 0 3px rgba(41,157,107,.35)}",
      ".sl-bar.is-ptr .sl-blk:focus-visible{outline:none}",
      ".sl-bar.is-ptr .sl-hd:focus-visible .sl-grip{border-color:#444CE7;box-shadow:0 1px 3px rgba(16,24,40,.18)}",
      ".sl-std{margin:0;font:400 12.5px/18px Onest,sans-serif;color:#667085}",

      ".sl-leg{display:flex;flex-wrap:wrap;gap:6px 18px;font:500 12.5px/18px Onest,sans-serif;color:#475467}",
      ".sl-leg span{display:inline-flex;align-items:center;gap:6px}",
      ".sl-leg i{width:14px;height:10px;border-radius:3px;display:inline-block}"
    ].join("\n"),
    sc: [
      ".sc-mins{display:flex;align-items:center;gap:8px;flex:none}",
      ".sc-seg{display:flex;border:1px solid #E4E7EC;border-radius:10px;overflow:hidden}",
      ".sc-seg button{height:34px;min-width:40px;padding:0 8px;border:0;border-left:1px solid #E4E7EC;background:#fff;font:600 13px Onest,sans-serif;color:#475467;cursor:pointer}",
      ".sc-seg button:first-child{border-left:0}",
      ".sc-seg button[aria-checked=true]{background:var(--c);color:#fff}",
      ".sc-seg button:focus-visible{outline-offset:-2px}",
      ".sc-u{font:500 13px Onest,sans-serif;color:#475467}",
      ".sc-tags{display:flex;flex-wrap:wrap;gap:8px}",
      ".sc-tag{display:inline-flex;align-items:center;gap:4px;min-height:36px;padding:4px 4px 4px 14px;border-radius:999px;background:var(--t);color:var(--c);font:600 13px/18px Onest,sans-serif}",
      ".sc-tag .sc-x{width:28px;height:28px;color:var(--c);font-size:17px}",
      ".sc-tag .sc-x:hover{background:rgba(255,255,255,.7);color:var(--c)}",
      ".sc-bgrid{display:grid;grid-template-columns:minmax(240px,1fr) auto;gap:16px;align-items:end}",
      ".sc-seg button:disabled{color:#D0D5DD;cursor:not-allowed}",
      ".sc-mins{height:44px}",
      ".sc-note{margin-top:-8px}",
      "@media (max-width:700px){.sc-bgrid{grid-template-columns:1fr}}"
    ].join("\n")
  };

  /* card heading with its points chip; title, points and hint can be overridden (the merged Sleep card) */
  /* the score explainer: an info mark beside the points, its tooltip opens on hover, focus or tap */
  /* the points chip is the explainer: an info mark inside it says the number can be opened */
  function tipMark(id, html) { return { id: id, html: html }; }
  function ptsTip(p, pts, t) {
    var chip = '<span class="rt-ii" aria-hidden="true">' + ICON.info + "</span>" + pts + " of 100";
    if (!t) return '<span class="' + p + '-pts">' + pts + " of 100</span>";
    return '<span class="rt-tw"><button type="button" class="rt-i ' + p + '-pts" aria-describedby="' + t.id + '">' + chip + "</button>" +
      '<span class="rt-tip" role="tooltip" id="' + t.id + '">' + t.html + "</span></span>";
  }
  /* solid icons: Phosphor fill (as GoodFlip's own icon set), and Tabler's zzz for sleep, drawn bold since no solid zz exists */
  var ph = function (d) { return '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var ICON = {
    hours: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h6l-6 8h6M13 4h7l-7 9h7"/></svg>',
    winddown: ph("M235.54,150.21a104.84,104.84,0,0,1-37,52.91A104,104,0,0,1,32,120,103.09,103.09,0,0,1,52.88,57.48a104.84,104.84,0,0,1,52.91-37,8,8,0,0,1,10,10,88.08,88.08,0,0,0,109.8,109.8,8,8,0,0,1,10,10Z"),
    breathing: ph("M120,104H24a8,8,0,0,1-8-8.53A8.17,8.17,0,0,1,24.27,88H112a8,8,0,0,0,8-8.53A8.17,8.17,0,0,0,111.73,72H92.29a4,4,0,0,1-4-4.58A32,32,0,1,1,120,104Zm119.92-2.29a32,32,0,0,0-63.59-2.29,4,4,0,0,0,4,4.58h19.44a8.17,8.17,0,0,1,8.25,7.47,8,8,0,0,1-8,8.53H32.27A8.17,8.17,0,0,0,24,127.47,8,8,0,0,0,32,136H208A32,32,0,0,0,239.92,101.71ZM152,152H40.27A8.17,8.17,0,0,0,32,159.47,8,8,0,0,0,40,168H143.73a8.17,8.17,0,0,1,8.25,7.47,8,8,0,0,1-8,8.53H124.29a4,4,0,0,0-4,4.58A32,32,0,1,0,152,152Z"),
    metime: ph("M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z"),
    mood: ph("M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM92,96a12,12,0,1,1-12,12A12,12,0,0,1,92,96Zm82.92,60c-10.29,17.79-27.39,28-46.92,28s-36.63-10.2-46.92-28a8,8,0,1,1,13.84-8c7.47,12.91,19.21,20,33.08,20s25.61-7.1,33.08-20a8,8,0,1,1,13.84,8ZM164,120a12,12,0,1,1,12-12A12,12,0,0,1,164,120Z"),
    info: ph("M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-4,48a12,12,0,1,1-12,12A12,12,0,0,1,124,72Zm12,112a16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40a8,8,0,0,1,0,16Z")
  };
  var rtcss = document.createElement("style");
  rtcss.textContent =
    ".rt-pr{display:inline-flex;align-items:center;gap:8px}" +
    ".rt-tw{position:relative;display:inline-flex}" +
    /* the points read as plain text with a quiet info mark; only hover or focus marks them */
    ".rt-pr [class$=-pts]{background:none;color:#475467;font-weight:600;padding:4px 8px}" +
    ".rt-i{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:8px;cursor:help;transition:background .15s ease,color .15s ease}" +
    ".rt-ii{width:16px;height:16px;display:grid;place-items:center;color:#98A2B3}.rt-ii svg{width:16px;height:16px}" +
    ".rt-i:hover,.rt-i:focus-visible,.rt-tw.open .rt-i{outline:none;background:#F2F4F7;color:#101828}.rt-i:hover .rt-ii,.rt-tw.open .rt-ii{color:#444CE7}" +
    ".rt-ic{width:32px;height:32px;flex:none;border-radius:10px;background:#EEF4FF;color:#444CE7;display:grid;place-items:center}.rt-ic svg{width:18px;height:18px}" +
    ".rt-tip{position:absolute;z-index:20;right:-8px;top:calc(100% + 10px);width:320px;padding:14px 16px;border-radius:14px;background:#101828;color:#EAECF0;font:400 13px/19px Onest,sans-serif;" +
      "box-shadow:0 12px 32px rgba(16,24,40,.22);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .18s ease,transform .18s ease,visibility 0s .18s;text-align:left}" +
    ".rt-tip::before{content:'';position:absolute;right:14px;top:-6px;width:12px;height:12px;background:#101828;transform:rotate(45deg);border-radius:2px}" +
    ".rt-tw:hover .rt-tip,.rt-tw:focus-within .rt-tip,.rt-tw.open .rt-tip{opacity:1;visibility:visible;transform:none;transition:opacity .18s ease,transform .18s ease}" +
    ".rt-h{display:block;margin-bottom:8px;font:700 13px/18px Onest,sans-serif;color:#fff}" +
    ".rt-r{display:block}.rt-r+.rt-r{margin-top:8px}.rt-r b{display:block;font-weight:600;color:#C7D7FE}" +
    ".rt-n{display:block;margin-top:10px;color:#98A2B3;font-size:12px}";
  document.head.appendChild(rtcss);
  /* a tap opens and closes it on touch screens */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".rt-i");
    document.querySelectorAll(".rt-tw.open").forEach(function (w) { if (!b || w !== b.parentNode) w.classList.remove("open"); });
    if (b) b.parentNode.classList.toggle("open");
  });
  function cardHead(p, key, title, pts, hint, tip) {
    var x = part(key);
    return '<div class="' + p + '-ch"><h3><span class="rt-ic">' + ICON[key] + "</span>" + (title || x.name) + '</h3><span class="rt-pr">' + ptsTip(p, pts || x.w, tip) + "</span></div>" +
      '<p class="' + p + '-hint">' + esc(hint || x.hint) + "</p>";
  }
  /* one toast per module, with Undo */
  function toast(p, msg, undo) {
    var t = document.getElementById(p + "-toast");
    if (!t) { t = document.createElement("div"); t.id = p + "-toast"; t.className = p + "-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = "<span>" + esc(msg) + '</span><button type="button">Undo</button>';
    clearTimeout(t._h); t.classList.add("show");
    t.querySelector("button").onclick = function () { t.classList.remove("show"); undo(); };
    t._h = setTimeout(function () { t.classList.remove("show"); }, 6000);
  }
  var same = function (a, b) { return a.trim().toLowerCase() === b.trim().toLowerCase(); };
  function refocus(el, key) { if (!key) return; var g = document.getElementById(key); if (g && el.contains(g)) return g.focus(); var f = el.querySelector('[data-fk="' + key + '"]'); if (f && !f.disabled) f.focus(); else if (f) { var o = el.querySelector('[data-fk="' + key.replace(/[+-]$/, function (c) { return c === "+" ? "-" : "+"; }) + '"]'); if (o) o.focus(); } }

  /* ---------- one popover for the time picker, the dropdowns and the smart field ----------
     The trigger keeps focus (aria-activedescendant), so arrows, Enter and Escape work from it, and typing works in a field.
     opts: [[value, label, aside]]; pick(value) runs after it closes. */
  var POP = (function () {
    var box = null, cur = null;
    var css = document.createElement("style");
    css.textContent =
      ".rt-pop{position:fixed;z-index:60;min-width:160px;max-height:280px;overflow:auto;padding:6px;background:#fff;border:1px solid #E4E7EC;border-radius:14px;box-shadow:0 12px 32px rgba(16,24,40,.14);" +
        "font:500 14px/20px Onest,system-ui,sans-serif;color:#101828;animation:rt-in .14s ease;scrollbar-width:thin}" +
      "@keyframes rt-in{from{opacity:0;transform:translateY(-4px)}}" +
      ".rt-po{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:9px;cursor:pointer;font-variant-numeric:tabular-nums}" +
      ".rt-po .a{margin-left:auto;padding-left:12px;font-size:12.5px;color:#667085;white-space:nowrap}" +
      ".rt-po.act{background:#F3FCF8}.rt-po[aria-selected=true]{color:#2A805A;font-weight:700}" +
      ".rt-po[aria-selected=true]::after{content:'';width:6px;height:6px;border-radius:50%;background:#299D6B;margin-left:8px;flex:none}" +
      ".rt-po.own{border-top:1px solid #F2F4F7;border-radius:0 0 9px 9px;margin-top:4px}" +
      ".rt-po mark{background:none;color:#299D6B;font-weight:700}" +
      ".rt-pe{padding:10px 12px;color:#667085;font-size:13px}" +
      /* the trigger: a quiet field with its value and a small mark */
      ".rt-tp{display:inline-flex;align-items:center;justify-content:space-between;gap:8px;height:36px;padding:0 10px 0 12px;border:1px solid #E4E7EC;border-radius:10px;background:#F3FCF8;" +
        "font:600 14px Onest,sans-serif;color:#101828;cursor:pointer;font-variant-numeric:tabular-nums;white-space:nowrap;transition:border-color .15s ease,box-shadow .15s ease}" +
      ".rt-tp:hover{border-color:#D0D5DD}.rt-tp[aria-expanded=true],.rt-tp:focus-visible{outline:none;border-color:#299D6B;box-shadow:0 0 0 3px rgba(41,157,107,.18)}" +
      ".rt-tp svg{width:14px;height:14px;flex:none;color:#667085}.rt-tp.big{height:44px;width:100%;border-radius:11px;padding:0 14px}" +
      ".rt-tp.need{background:#FFFAEB;border-color:#FEC84B;color:#B54708}" +
      "[data-tlat]{width:116px;flex:none}[data-bm]{width:96px;flex:none}.rt-nm{width:100%;max-width:360px;background:#fff}.rt-nm span{overflow:hidden;text-overflow:ellipsis}";
    document.head.appendChild(css);
    function close(refocus) {
      if (!box) return; var t = cur.t; box.remove(); box = null; cur = null;
      t.setAttribute("aria-expanded", "false"); t.removeAttribute("aria-activedescendant");
      document.removeEventListener("keydown", key, true);
      if (refocus && document.body.contains(t)) t.focus();
    }
    function act(i) {
      var os = box.querySelectorAll(".rt-po"); if (!os.length) return;
      cur.i = (i + os.length) % os.length;
      os.forEach(function (o, k) { o.classList.toggle("act", k === cur.i); });
      cur.t.setAttribute("aria-activedescendant", os[cur.i].id);
      var o = os[cur.i]; if (o.offsetTop < box.scrollTop || o.offsetTop + o.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = o.offsetTop - box.clientHeight / 2 + o.offsetHeight / 2;
    }
    function choose(i) { var o = cur.opts[i]; if (!o) return; var f = cur.pick, typing = cur.typing; close(!typing); f(o[0]); }
    function key(e) {
      if (!cur || e.target !== cur.t) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); act(cur.i + (e.key === "ArrowDown" ? 1 : -1)); }
      else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); choose(cur.i); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === "Tab") close(false);
    }
    function place() {
      var r = cur.t.getBoundingClientRect(), h = Math.min(280, box.scrollHeight + 2), below = window.innerHeight - r.bottom - 12;
      box.style.left = Math.min(r.left, window.innerWidth - Math.max(r.width, 160) - 12) + "px";
      box.style.width = Math.max(r.width, cur.w || 0) + "px";
      box.style.top = (below >= h || below >= r.top ? r.bottom + 6 : r.top - 6 - h) + "px";
    }
    function open(t, opts, val, pick, o) {
      o = o || {};
      var keep = box && cur && cur.t === t;   /* the smart field re-opens on every keystroke: keep the box, swap the rows */
      if (!keep) { close(false); box = document.createElement("div"); box.className = "rt-pop"; box.setAttribute("role", "listbox"); box.id = "rt-pop"; document.body.appendChild(box); document.addEventListener("keydown", key, true); }
      cur = { t: t, opts: opts, pick: pick, i: 0, typing: !!o.typing, w: o.w };
      box.innerHTML = opts.length ? opts.map(function (x, i) {
        return '<div role="option" class="rt-po' + (x[3] ? " own" : "") + '" id="rt-po' + i + '" data-i="' + i + '" aria-selected="' + (x[0] === val) + '"><span>' + x[1] + "</span>" + (x[2] ? '<span class="a">' + x[2] + "</span>" : "") + "</div>";
      }).join("") : '<div class="rt-pe">' + (o.empty || "Nothing matches") + "</div>";
      t.setAttribute("aria-expanded", "true"); t.setAttribute("aria-controls", "rt-pop");
      place();
      var at = opts.map(function (x) { return x[0]; }).indexOf(val);
      if (at < 0 && o.near != null) at = o.near;
      act(Math.max(0, at));
      box.onmousedown = function (e) { e.preventDefault(); };
      box.onclick = function (e) { var x = e.target.closest(".rt-po"); if (x) choose(+x.dataset.i); };
      box.onmousemove = function (e) { var x = e.target.closest(".rt-po"); if (x && +x.dataset.i !== cur.i) act(+x.dataset.i); };
    }
    document.addEventListener("mousedown", function (e) { if (box && !box.contains(e.target) && e.target !== cur.t) close(false); });
    window.addEventListener("resize", function () { close(false); });
    /* a scroll carries the list with its field; it closes only once the field has left the screen */
    document.addEventListener("scroll", function (e) {
      if (!box || box.contains(e.target)) return;
      var r = cur.t.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) close(false); else place();
    }, true);
    return { open: open, close: close, isOpen: function (t) { return !!(box && cur && cur.t === t); } };
  })();

  /* time: a field with the time in it; a list of quarter hours opens under it. Up and Down move it 15 minutes without opening. */
  var CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var SLOTS = []; for (var q15 = 0; q15 < 96; q15++) SLOTS.push(("0" + Math.floor(q15 / 4)).slice(-2) + ":" + ("0" + q15 % 4 * 15).slice(-2));
  function tpBtn(attrs, v, label, big) {
    return '<button type="button" class="rt-tp' + (big ? " big" : "") + (v ? "" : " need") + '" aria-haspopup="listbox" aria-expanded="false" data-v="' + esc(v || "") + '" aria-label="' + esc(label) + (v ? ", " + H.t12(v) : ", not set") + '" ' + attrs + ">" +
      "<span>" + (v ? H.t12(v) : "Set time") + "</span>" + CLOCK + "</button>";
  }
  /* an inline error: the field turns red, the message sits under its row, the cursor goes there. It clears on the next edit */
  var ecss = document.createElement("style");
  ecss.textContent = ".rt-bad,.rt-bad:hover{border-color:#F04438 !important;box-shadow:0 0 0 3px rgba(240,68,56,.14) !important}" +
    ".rt-ferr{display:flex;align-items:center;gap:6px;margin:-2px 0 0 4px;font:500 12.5px/18px Onest,sans-serif;color:#B42318;animation:rt-in .16s ease}" +
    ".rt-ferr svg{width:14px;height:14px;flex:none}";
  document.head.appendChild(ecss);
  /* a text field at its maxlength says so in a line under it, while typing or after a paste; it goes once the text is shorter.
     One listener for every Mind plan field with a maxlength */
  if (!window.MP_LIMIT) {
    window.MP_LIMIT = 1;
    var lst = document.createElement("style");
    lst.textContent = ".ml-note{display:flex;align-items:center;gap:6px;margin:6px 0 0;font:500 12.5px/18px Onest,sans-serif;color:#B54708}.ml-note::before{content:'';width:6px;height:6px;border-radius:50%;background:#F79009;flex:none}";
    document.head.appendChild(lst);
    document.addEventListener("input", function (e) {
      var f = e.target, max = f.maxLength;
      if (!(f.matches && f.matches("input[maxlength],textarea[maxlength]")) || max < 1) return;
      var row = f.closest(".sl-row,.sc-row,.sl-f,.sc-f,.mp-fld,.pr-hab") || f, note = row.nextElementSibling;
      var on = f.value.length >= max, has = note && note.classList.contains("ml-note");
      if (on && !has) { note = document.createElement("p"); note.className = "ml-note"; note.setAttribute("role", "status"); row.after(note); }
      if (on) note.textContent = "That is the " + max + " character limit. Anything more will not fit.";
      else if (has) note.remove();
    }, true);
  }
  function clearErr(n) {
    if (!n || !n.classList.contains("rt-bad")) return;
    n.classList.remove("rt-bad"); n.removeAttribute("aria-invalid"); n.removeAttribute("aria-describedby");
    var m = document.getElementById("rt-ferr"); if (m) m.remove();
  }
  function flagField(n, msg) {
    if (!n) return false;
    var old = document.querySelector(".rt-bad"); if (old) clearErr(old);
    var at = n.closest(".sl-row,.sc-row,.sl-f,.sc-f,.sc-cbx") || n, m = document.createElement("div");
    m.className = "rt-ferr"; m.id = "rt-ferr"; m.setAttribute("role", "alert");
    m.innerHTML = '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z"/></svg><span>' + esc(msg) + "</span>";
    at.insertAdjacentElement("afterend", m);
    n.classList.add("rt-bad"); n.setAttribute("aria-invalid", "true"); n.setAttribute("aria-describedby", "rt-ferr");
    var off = function () { clearErr(n); n.removeEventListener("input", off); };
    n.addEventListener("input", off);
    n.scrollIntoView({ block: "center", behavior: "smooth" });
    n.focus({ preventScroll: true });
    return true;
  }
  function tpSet(b, v) { clearErr(b); b.dataset.v = v; b.classList.toggle("need", !v); b.firstChild.textContent = v ? H.t12(v) : "Set time"; b.setAttribute("aria-label", b.getAttribute("aria-label").replace(/, [^,]+$/, ", " + (v ? H.t12(v) : "not set"))); }
  /* wire a time trigger: change(v) gets "HH:MM" */
  function tpWire(b, change, near) {
    var pick = function (v) { tpSet(b, v); change(v); };
    b.onclick = function () {
      if (POP.isOpen(b)) return POP.close(true);
      var n = near ? SLOTS.indexOf(near) : 84;   /* nothing set yet: open around 9 PM */
      POP.open(b, SLOTS.map(function (x) { return [x, H.t12(x)]; }), b.dataset.v, pick, { near: n, w: 140 });
    };
    b.onkeydown = function (e) {
      if (POP.isOpen(b) || !b.dataset.v || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
      e.preventDefault(); var i = SLOTS.indexOf(b.dataset.v); pick(SLOTS[(i + (e.key === "ArrowUp" ? 1 : -1) + 96) % 96]);
    };
  }
  /* a dropdown: the same field, a short list */
  function ddBtn(attrs, v, text, label) {
    return '<button type="button" class="rt-tp" aria-haspopup="listbox" aria-expanded="false" aria-label="' + esc(label) + '" data-v="' + esc(v) + '" ' + attrs + "><span>" + esc(text) + "</span>" + CHEV + "</button>";
  }
  function ddWire(b, opts, change) {
    b.onclick = function () { if (POP.isOpen(b)) return POP.close(true); POP.open(b, opts, b.dataset.v, function (v) { change(v); }, { w: b.offsetWidth }); };
  }

  /* a text field that offers suggestions: clicking it lists them, typing filters, a pick fills the text and it stays editable.
     sugs() gives [[label, aside]]; pick(label) and edit(text) report back. */
  function suggestField(f, sugs, pick, edit) {
    var show = function () {
      var t = f.value.trim(), lt = t.toLowerCase(), all = sugs(), exact = all.filter(function (x) { return same(x[0], t); })[0];
      var L = all.filter(function (x) { return exact || !lt || x[0].toLowerCase().indexOf(lt) >= 0; }).map(function (x) { return [x[0], exact ? esc(x[0]) : hl(x[0], t), x[1]]; });
      if (!L.length) return POP.close(false);   /* their own words: nothing to suggest, the text is the item */
      POP.open(f, L, exact ? exact[0] : null, function (v) { f.value = v; clearErr(f); pick(v); f.focus(); }, { typing: true });
    };
    f.onfocus = f.onclick = function () { if (!POP.isOpen(f)) show(); };
    f.oninput = function () { edit(f.value); show(); };
    f.onblur = function () { f.value = f.value.trim(); edit(f.value); POP.close(false); };
  }

  /* ---------- the timed list: one pattern for wind-down, breathing, me-time and mood ----------
     Rows: the name, anything extra (breathing's minutes), its time, remove. Under them one field: click it and the
     suggestions open with their usual times; type to filter or to add your own. A suggestion comes in with its time and the
     cursor on it; a task of their own opens its time straight away.
     c = { p, id, items, max, min, name(x), sugs [[label, at]], own, swap, dupes, extra(x, i), wire(el), def(n), noun, ph, one } */
  var TYPED = {};   /* what is typed in each field, kept across redraws */
  var hl = function (l, q) { var i = q ? l.toLowerCase().indexOf(q.toLowerCase()) : -1; return i < 0 ? esc(l) : esc(l.slice(0, i)) + "<mark>" + esc(l.slice(i, i + q.length)) + "</mark>" + esc(l.slice(i + q.length)); };
  function tlHtml(c) {
    var p = c.p, n = c.items.length, full = n >= c.max && !c.swap;
    var rows = n ? '<div class="' + p + '-list">' + c.items.map(function (x, i) {
      /* a list of fixed choices (breathing): the name is a dropdown, so a picked exercise can be changed in place */
      var nm = c.pick ? '<span class="' + p + '-rt">' + ddBtn('data-tlname="' + c.id + '" data-i="' + i + '" data-fk="' + c.id + "nm" + i + '"', c.name(x, i), c.name(x, i), "Change " + c.name(x, i)).replace('class="rt-tp"', 'class="rt-tp rt-nm"') + "</span>"
        : '<span class="' + p + '-rt">' + esc(c.name(x, i)) + "</span>";
      return '<div class="' + p + '-row">' + nm + (c.extra ? c.extra(x, i) : "") +
        tpBtn('data-tlat="' + c.id + '" data-i="' + i + '" data-fk="' + c.id + "at" + i + '"', x.at, "Time for " + c.name(x, i)) +
        (n > (c.min || 0) ? '<button type="button" class="' + p + '-x" data-tldel="' + c.id + '" data-i="' + i + '" data-fk="' + c.id + "del" + i + '" aria-label="Remove ' + esc(c.name(x, i)) + '">×</button>' : '<span class="' + p + '-xs"></span>') + "</div>";
    }).join("") + "</div>" : c.empty ? '<div class="' + p + '-empty">' + c.empty + "</div>" : "";
    var add = full ? '<span class="' + p + '-note">That is the most for one day. Remove one to add another.</span>'
      : c.one ? '<button type="button" class="' + p + '-more" data-tlone="' + c.id + '" data-fk="' + c.id + 'one">+ ' + c.one + "</button>"
      : '<div class="' + p + '-cbx"><input class="' + p + '-in" id="' + c.id + '-q" role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" maxlength="80" placeholder="' + esc(c.ph) + '" value="' + esc(TYPED[c.id] || "") + '"></div>';
    return rows + add;
  }
  function tlBind(el, c, done) {
    var q = function (sel) { return el.querySelectorAll("[" + sel + '="' + c.id + '"]'); };
    var add = function (x) {
      if (c.swap && c.items.length) { x.at = c.items[0].at; c.items[0] = x; } else c.items.push(x);   /* a swap keeps the time already set */
      var k = c.swap ? 0 : c.items.length - 1; TYPED[c.id] = "";
      done(c.id + "at" + k);
      if (!x.at) { var b = el.querySelector('[data-fk="' + c.id + "at" + k + '"]'); if (b) b.click(); }   /* their own task: its time opens at once */
    };
    q("data-tlat").forEach(function (b) { var x = c.items[+b.dataset.i]; tpWire(b, function (v) { x.at = v; MP.changed(); }, x.at || c.def(+b.dataset.i)); });
    q("data-tldel").forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.i, x = c.items.splice(i, 1)[0];
        done(c.items.length ? c.id + "del" + Math.min(i, c.items.length - 1) : c.id + "-q");
        toast(c.p, "Removed " + c.name(x, i), function () { if (c.items.length >= c.max) return; c.items.splice(Math.min(i, c.items.length), 0, x); done(); });
      };
    });
    q("data-tlname").forEach(function (b) {
      var i = +b.dataset.i, x = c.items[i];
      ddWire(b, c.sugs.map(function (s) { return [s[0], esc(s[0]), s[1] ? "usually " + H.t12(s[1]).replace(":00 ", " ") : ""]; }), function (v) {
        var y = c.make(v, x.at); y.at = x.at; c.items[i] = y; done(c.id + "nm" + i);   /* a new exercise keeps the time, takes its own minutes */
      });
    });
    q("data-tlone").forEach(function (b) { b.onclick = function () { add(c.make("", c.def(c.items.length))); }; });
    if (c.wire) c.wire(el);
    var f = document.getElementById(c.id + "-q"); if (!f) return;
    var list = function () {
      var t = f.value.trim(), lt = t.toLowerCase();
      var taken = function (l) { return !c.dupes && c.items.some(function (x) { return same(c.name(x), l); }); };
      var L = c.sugs.filter(function (s) { return !taken(s[0]) && (!lt || s[0].toLowerCase().indexOf(lt) >= 0); })
        .map(function (s) { return ["s:" + s[0], hl(s[0], t), s[1] ? "usually " + H.t12(s[1]).replace(":00 ", " ") : ""]; });
      if (c.own && t && !c.sugs.some(function (s) { return same(s[0], t); }) && !taken(t)) L.push(["o:" + t, "Add “" + esc(t) + "” as your own", "you set the time", true]);
      return L;
    };
    var show = function () {
      POP.open(f, list(), null, function (v) {
        var l = v.slice(2), s = c.sugs.filter(function (x) { return x[0] === l; })[0];
        if (v[0] === "o" && c.items.some(function (x) { return same(c.name(x), l); })) return;
        add(c.make(l, s ? s[1] || c.def(c.items.length) : ""), !!s);
      }, { typing: true, empty: c.own ? "Type to add your own" : "Nothing matches" });
    };
    f.onfocus = f.onclick = function () { if (!POP.isOpen(f)) show(); };
    f.oninput = function () { TYPED[c.id] = f.value; show(); };
    f.onblur = function () { POP.close(false); };
  }

  /* ---------- Sleep ---------- */
  /* one fixed standard for everyone: the coach sets the target and the window, never these */
  var FIXED = { shortZero: 3, excess: true, overAllowed: 1, overLose: 20, allowance: 30, zeroAt: 120 };
  var Q = 15, MINM = 240, MAXM = 720, WDMAX = 6;   /* drag snaps to 15 minutes; the window is 4 to 12 hours */
  var STP = { hours: [.5, 4, 12, "h"], shortZero: [.5, 1, 6, "h"] };
  var hm = function (m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + m % 60).slice(-2); };
  var durM = function (r) { return Math.round(r.hours * 60); };
  /* hours read the same everywhere: 7.5 h on the half hour, 7 h 45 min between */
  var hrs = function (h) { var m = Math.round(h * 60); return m % 30 ? len(m) : num(h) + " h"; };
  var hrsHtml = function (h) { var m = Math.round(h * 60); return m % 30 ? Math.floor(m / 60) + "<small>h</small>&nbsp;" + m % 60 + "<small>min</small>" : num(h) + "<small>h</small>"; };
  function bounds(r, k) {
    var c = STP[k], lo = c[1], hi = c[2];
    if (k === "shortZero") hi = Math.min(hi, r.hours);
    return [lo, hi];
  }
  /* keep the plan consistent: fixed standard, 15 minute hours, wake = bedtime + hours */
  function settle(r) {
    for (var k in FIXED) r[k] = FIXED[k];
    r.hours = r.second ? Math.min(8, Math.max(1, Math.round((+r.hours || 5.5) * 4) / 4)) : Math.min(12, Math.max(4, Math.round((+r.hours || 7.5) * 4) / 4));
    if (!okTime(r.bedtime)) r.bedtime = "22:30";
    r.bedtime = r.bedtime.slice(0, 5);
    r.wake = hm(mins(r.bedtime) + durM(r));
    /* a second sleep window (night shifts, sleep split in two): its own bedtime and length, 1 to 8 hours */
    if (r.second) {
      var s2 = r.second;
      s2.hours = Math.min(8, Math.max(1, Math.round((+s2.hours || 2) * 4) / 4));
      if (!okTime(s2.bedtime)) s2.bedtime = hm(mins(r.wake) + 480);
      s2.bedtime = s2.bedtime.slice(0, 5);
      s2.wake = hm(mins(s2.bedtime) + Math.round(s2.hours * 60));
    }
  }
  /* the day's target is both windows together; with two, each window carries half of the window points */
  var totalH = function (r) { return r.hours + (r.second ? r.second.hours : 0); };
  /* the gap between the two windows in minutes, the shorter way round the clock; 0 when they touch or overlap.
     Under 1 hour their full-marks bands meet, so they read as one sleep */
  var CLOSE = 60;
  function apart(r) {
    if (!r.second || overlap(r)) return 0;
    var a = mins(r.bedtime), b = a + durM(r), c = mins(r.second.bedtime), d = c + Math.round(r.second.hours * 60), m = function (x) { return ((x % 1440) + 1440) % 1440; };
    return Math.min(m(c - b), m(a - d));
  }
  var tooClose = function (r) { return !!r.second && apart(r) < CLOSE; };
  /* do the two windows share any minute of the day? */
  function overlap(r) {
    if (!r.second) return false;
    var a = mins(r.bedtime), b = a + durM(r), c = mins(r.second.bedtime), d = c + Math.round(r.second.hours * 60);
    return [-1440, 0, 1440].some(function (k) { return c + k < b && a < d + k; });
  }
  function stepper(r, k, label, note) {
    var c = STP[k], v = r[k], b = bounds(r, k);
    return '<div class="sl-f"><span class="sl-lab" id="sl-l-' + k + '">' + label + '</span><div class="sl-stp" role="group" aria-labelledby="sl-l-' + k + '">' +
      '<button type="button" class="sl-sb" data-st="' + k + '" data-d="-1" data-fk="' + k + '-" aria-label="Less"' + (v - c[0] < b[0] - 1e-9 ? " disabled" : "") + ">−</button>" +
      '<output class="sl-sv" aria-live="polite">' + (k === "hours" ? hrsHtml(v) : num(v) + "<small>" + c[3] + "</small>") + "</output>" +
      '<button type="button" class="sl-sb" data-st="' + k + '" data-d="1" data-fk="' + k + '+" aria-label="More"' + (v + c[0] > b[1] + 1e-9 ? " disabled" : "") + ">+</button></div>" +
      (note ? '<span class="sl-note">' + note + "</span>" : "") + "</div>";
  }
  function steppers(r) {
    if (!r.second) return stepper(r, "hours", "Target sleep in a day", "Steps of 0.5 h, or drag the bar");
    /* two windows: the day's target is their sum, so it is read here and changed in each window */
    var a = r.hours / totalH(r) * 100;
    return '<div class="sl-f sl-sumf"><span class="sl-lab">Target sleep in a day</span><div class="sl-sum"><b>' + hrsHtml(totalH(r)) + "</b>" +
      '<span class="sl-split"><i style="width:' + a + '%"><em>Window 1, ' + hrs(r.hours) + '</em></i><i style="width:' + (100 - a) + '%"><em>Window 2, ' + hrs(r.second.hours) + "</em></i></span></div>" +
      '<span class="sl-note">Change each window below, or drag them on the bar.</span></div>';
  }
  function hoursLine(r) {
    var T = totalH(r), zero = hrs(Math.max(0, T - r.shortZero)), over = hrs(T + 1);
    if (r.second) return '<b class="rt-h">How the 47 points work</b>' +
      '<span class="rt-r"><b>Hours, 23</b>The two windows together: full marks for ' + hrs(T) + " to " + over + " of sleep in the day. Less earns fewer, down to zero at " + zero + " or less.</span>" +
      '<span class="rt-r"><b>Window, 24</b>12 points for each window, for sleeping and waking within 30 minutes of its times. Further off earns fewer, down to zero at 2 hours off.</span>' +
      '<span class="rt-n">The same standard for every patient.</span>';
    return '<b class="rt-h">How the 47 points work</b>' +
      '<span class="rt-r"><b>Hours, 23</b>Full marks for ' + hrs(r.hours) + " to " + over + " of sleep. Less sleep earns fewer, down to zero at " + zero + " or less. Past " + over + ", each extra hour loses 20%.</span>" +
      '<span class="rt-r"><b>Window, 24</b>Full marks for sleeping within 30 minutes of ' + H.t12(r.bedtime) + " and waking within 30 minutes of " + H.t12(r.wake) + ". Further off earns fewer, down to zero at 2 hours off.</span>" +
      '<span class="rt-n">The same standard for every patient.</span>';
  }
  function wdLine(n, w) {
    return '<b class="rt-h">How the ' + w + " points work</b>" +
      (n ? '<span class="rt-r">Each task done earns ' + w + " ÷ " + n + " = " + num(w / n) + " points. All " + n + " done earns the full " + w + ". A task left undone adds nothing.</span>"
         : '<span class="rt-r">Add tasks and the ' + w + " points are shared between them. Each task done earns its share.</span>");
  }

  /* the night bar: noon to noon, the planned sleep, full marks band and the fall to zero around each time */
  var NB = { W: 960, L: 8, w: 944, y: 34, h: 24, VH: 86 };
  var X = function (m) { return NB.L + m / 1440 * NB.w; };
  var pct = function (m) { return X(m) / NB.W * 100; };
  var fromNoon = function (hmv) { return (mins(hmv) - 720 + 1440) % 1440; };
  var onAxis = function (m) { return m > 1440 ? m - 1440 : m; };   /* wake past the right edge wraps to the left */
  function night(r) {
    var W = NB.W, y = NB.y, h = NB.h, A = r.allowance, Z = r.zeroAt;
    var bed = fromNoon(r.bedtime), wake = bed + durM(r);
    var spans = function (a, b, attr) {   /* draw [a,b] in minutes from noon, wrapping across the frame */
      var out = "";
      [-1440, 0, 1440].forEach(function (s) { var x0 = Math.max(0, a + s), x1 = Math.min(1440, b + s); if (x1 > x0) out += '<rect x="' + X(x0).toFixed(1) + '" y="' + y + '" width="' + (X(x1) - X(x0)).toFixed(1) + '" height="' + h + '" ' + attr + "/>"; });
      return out;
    };
    var edge = function (m) {
      return spans(m - Z, m - A, 'fill="url(#sl-fl)"') + spans(m + A, m + Z, 'fill="url(#sl-fr)"') + spans(m - A, m + A, 'fill="#444CE7"');
    };
    var mark = function (m, label) {
      var x = X(onAxis(m)), anchor = x < 70 ? "start" : x > W - 70 ? "end" : "middle";
      return '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (y - 6) + '" y2="' + (y + h + 4) + '" stroke="#101828" stroke-width="1.5"/>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y - 12) + '" text-anchor="' + anchor + '" font-family="Onest,sans-serif" font-size="13" font-weight="700" fill="#101828">' + label + "</text>";
    };
    var ticks = "";
    for (var i = 0; i <= 8; i++) {
      var tm = i * 180, lab = ["12 PM", "3 PM", "6 PM", "9 PM", "12 AM", "3 AM", "6 AM", "9 AM", "12 PM"][i];
      ticks += '<line x1="' + X(tm) + '" x2="' + X(tm) + '" y1="' + (y + h) + '" y2="' + (y + h + 5) + '" stroke="#D0D5DD"/>' +
        '<text x="' + X(tm) + '" y="' + (y + h + 20) + '" text-anchor="' + (i === 0 ? "start" : i === 8 ? "end" : "middle") + '" font-family="Onest,sans-serif" font-size="12" fill="#667085">' + lab + "</text>";
    }
    return '<svg viewBox="0 0 ' + W + " " + NB.VH + '" role="img" aria-label="Sleep window from ' + H.t12(r.bedtime) + " to " + H.t12(r.wake) + ", full marks within " + A + " minutes, zero at " + Z + ' minutes off">' +
      '<defs><linearGradient id="sl-fl"><stop offset="0" stop-color="#444CE7" stop-opacity="0"/><stop offset="1" stop-color="#444CE7" stop-opacity=".55"/></linearGradient>' +
      '<linearGradient id="sl-fr"><stop offset="0" stop-color="#444CE7" stop-opacity=".55"/><stop offset="1" stop-color="#444CE7" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="sl-clip"><rect x="' + NB.L + '" y="' + y + '" width="' + NB.w + '" height="' + h + '" rx="8"/></clipPath></defs>' +
      '<g clip-path="url(#sl-clip)"><rect x="' + NB.L + '" y="' + y + '" width="' + NB.w + '" height="' + h + '" fill="#F2F4F7"/>' +
      spans(bed, wake, 'fill="#C7D7FE"') + edge(bed) + edge(wake) + sec("g") + "</g>" + ticks +
      (r.second ? midMark(bed, wake, "1", r.bedtime, r.wake) : mark(bed, "Bed " + H.t12(r.bedtime)) + mark(wake, "Wake " + H.t12(r.wake))) + sec("m") + "</svg>";
    /* two windows: each window's two lines and one label over its middle, numbered as in the rows below */
    function midMark(a, b, n, t1, t2) {
      var tick = function (m) { var x = X(onAxis(m)).toFixed(1); return '<line x1="' + x + '" x2="' + x + '" y1="' + (y - 6) + '" y2="' + (y + h + 4) + '" stroke="#101828" stroke-width="1.5"/>'; };
      var mid = X(onAxis((a + b) / 2)), anc = mid < 110 ? "start" : mid > W - 110 ? "end" : "middle";
      return tick(a) + tick(b) + '<text x="' + mid.toFixed(1) + '" y="' + (y - 12) + '" text-anchor="' + anc + '" font-family="Onest,sans-serif" font-size="13" font-weight="700" fill="#101828">' + n + " · " + H.t12(t1) + " to " + H.t12(t2) + "</text>";
    }
    /* the second window on the same bar, set from its fields rather than dragged */
    function sec(what) {
      if (!r.second) return "";
      var b2 = fromNoon(r.second.bedtime), w2 = b2 + Math.round(r.second.hours * 60);
      if (what === "g") return spans(b2, w2, 'fill="#C7D7FE"') + edge(b2) + edge(w2);
      return midMark(b2, w2, "2", r.second.bedtime, r.second.wake);
    }
  }
  function legend(r) {
    return '<span><i style="background:#C7D7FE"></i>Planned sleep, ' + len(Math.round(totalH(r) * 60)) + "</span>" +
      '<span><i style="background:#444CE7"></i>Full marks, within ' + len(r.allowance) + "</span>" +
      '<span><i style="background:linear-gradient(90deg,rgba(68,76,231,.55),rgba(68,76,231,0))"></i>Fewer marks, until ' + len(r.zeroAt) + " off</span>";
  }

  var sleepMode = "plan";   /* valid() has no ctx, so it reads the mode of the last render */
  MP.steps.sleep = {
    title: "Sleep",
    sub: function () { return "70 points"; },
    render: function (el, plan, ctx) {
      css("sl");
      var r = plan.rhythm, tpl = ctx && ctx.mode === "template"; sleepMode = tpl ? "template" : "plan";
      if (tpl && plan.about == null) plan.about = "";
      settle(r);

      function topCard() {
        if (tpl) return '<section class="sl-card"><div class="sl-grid" style="grid-template-columns:1fr 2fr">' +
          '<label class="sl-f"><span class="sl-lab">Template name</span><input class="sl-in" data-k="name" value="' + esc(plan.name) + '" placeholder="For example, Sleep reset"></label>' +
          '<label class="sl-f"><span class="sl-lab">About</span><input class="sl-in" data-k="about" value="' + esc(plan.about) + '" placeholder="One line on who this is for" maxlength="120"></label></div></section>';
        return '<section class="sl-card"><div class="sl-grid sl-g-plan">' +
          '<label class="sl-f"><span class="sl-lab">Plan name</span><input class="sl-in" data-k="name" value="' + esc(plan.name) + '" placeholder="For example, Mind plan, November"></label>' +
          '<label class="sl-f"><span class="sl-lab">Starts</span><input class="sl-in" type="date" data-k="start" value="' + esc(plan.start) + '"></label>' +
          '<label class="sl-f"><span class="sl-lab">Ends</span><input class="sl-in" type="date" data-k="end" value="' + esc(plan.end) + '"></label></div>' +
          /* quick lengths: each sets Ends from Starts; the one that matches the dates shows as picked */
          '<div class="sl-lens" role="group" aria-label="Plan length"><span class="sl-lab">Length</span>' + MP.LENGTHS.map(function (l, i) {
            return '<button type="button" class="sl-len" data-len="' + i + '" aria-pressed="' + (MP.endFor(plan.start, l[1]) === plan.end) + '">' + l[0] + "</button>";
          }).join("") + "</div></section>";
      }
      /* Sleep duration and window, one card: the window's length is the target */
      function sleepCard() {
        var pts = part("hours").w + part("window").w;
        return '<section class="sl-card" style="' + vars("in") + '">' +
          cardHead("sl", "hours", "Sleep", pts, "Full marks for the target hours, in bed close to the planned times. Drag the bar to set the window.", tipMark("sl-hl", hoursLine(r))) +
          '<div class="sl-grid" id="sl-steps">' + steppers(r) + "</div>" +
          '<div class="sl-night"><div class="sl-bar" id="sl-bar"><div id="sl-svg">' + night(r) + "</div>" +
          '<div class="sl-blk" data-drag="blk" tabindex="0" role="slider"></div><div class="sl-blk" data-drag="blk" tabindex="-1" aria-hidden="true"></div>' +
          '<div class="sl-hd" data-drag="bed" tabindex="0" role="slider"><span class="sl-grip"></span></div>' +
          '<div class="sl-hd" data-drag="wake" tabindex="0" role="slider"><span class="sl-grip"></span></div>' +
          (r.second ? '<div class="sl-blk" data-drag="blk2" tabindex="0" role="slider"></div><div class="sl-blk" data-drag="blk2" tabindex="-1" aria-hidden="true"></div>' +
            '<div class="sl-hd" data-drag="bed2" tabindex="0" role="slider"><span class="sl-grip"></span></div>' +
            '<div class="sl-hd" data-drag="wake2" tabindex="0" role="slider"><span class="sl-grip"></span></div>' : "") + "</div>" +
          '<div class="sl-leg" id="sl-leg">' + legend(r) + "</div></div>" +
          winsHtml() + "</section>";
      }
      /* one window by default: its bedtime and wake time under the bar. A second splits the day's target in two, and each
         window gets the same row: its length, bedtime and wake time. Removing the second gives its hours back to the first */
      function winsHtml() {
        if (!r.second) return '<div class="sl-grid">' +
          '<div class="sl-f"><span class="sl-lab">Bedtime</span>' + tpBtn('data-tk="bedtime"', r.bedtime, "Bedtime", true) + "</div>" +
          '<div class="sl-f"><span class="sl-lab">Wake time</span>' + tpBtn('data-tk="wake"', r.wake, "Wake time", true) + "</div></div>" +
          /* ponytail: two sleep windows are parked for now; ?split=1 brings the option back */
          (!/[?&]split=1/.test(location.search) ? "" : '<div class="sl-addw"><button type="button" class="sl-more" data-w2="add" data-fk="w2add">+ Split into two sleep windows</button>' +
          '<span class="sl-note">For night shifts, or sleep in two parts of the day. The ' + hrs(r.hours) + ' target is shared between them.</span></div>');
        return '<div class="sl-wins">' + winRow(1) + winRow(2) + "</div>" +
          '<div class="sl-tot' + (tooClose(r) ? " bad" : "") + '" id="sl-tot" role="status">' + totLine() + "</div>";
      }
      function winRow(n) {
        var o = n === 1 ? r : r.second, tk = n === 1 ? "data-tk" : "data-tk2", w = "data-w" + n;
        var stp = function (d, dis) { return '<button type="button" class="sl-sb" ' + w + '="' + d + '" data-fk="w' + n + d + '" aria-label="' + (d > 0 ? "Longer" : "Shorter") + " window " + n + '"' + (dis ? " disabled" : "") + ">" + (d > 0 ? "+" : "−") + "</button>"; };
        return '<div class="sl-win"><div class="sl-winh"><span class="sl-wn">' + n + "</span><b>Window " + n + "</b>" +
          (n === 2 ? '<button type="button" class="sl-x" data-w2="rm" data-fk="w2rm" aria-label="Remove window 2, its hours go back to window 1">×</button>' : "") + "</div>" +
          '<div class="sl-grid sl-g3">' +
          '<div class="sl-f"><span class="sl-lab" id="sl-l-w' + n + '">Length</span><div class="sl-stp" role="group" aria-labelledby="sl-l-w' + n + '">' + stp(-1, o.hours - .5 < 1) +
            '<output class="sl-sv" aria-live="polite">' + hrsHtml(o.hours) + "</output>" + stp(1, o.hours + .5 > 8) + "</div></div>" +
          '<div class="sl-f"><span class="sl-lab">Bedtime</span>' + tpBtn(tk + '="bedtime"', o.bedtime, "Window " + n + " bedtime", true) + "</div>" +
          '<div class="sl-f"><span class="sl-lab">Wake time</span>' + tpBtn(tk + '="wake"', o.wake, "Window " + n + " wake time", true) + "</div></div></div>";
      }
      function wireMerge() { var b = el.querySelector('[data-w2="merge"]'); if (b) b.onclick = function () { merge(); done("w2add"); }; }
      function totLine() {
        if (!tooClose(r)) return "Each window carries 12 of the 24 window points.";
        var g = apart(r);
        return '<span class="sl-cw">' + ICON.info + "<span><b>" + (overlap(r) ? "The two windows overlap." : g ? "The two windows are only " + len(g) + " apart." : "The two windows touch.") + "</b> " +
          "Sleep this close together is one sleep. Merge them into one window, or move one at least 1 hour away.</span></span>" +
          '<button type="button" class="sl-merge" data-w2="merge" data-fk="w2merge">Merge into One Window</button>';
      }
      /* merge: one window from the first bedtime to the last wake, the gap included, up to 12 hours */
      function merge() {
        var a = mins(r.bedtime), b = a + durM(r), c = mins(r.second.bedtime), d = c + Math.round(r.second.hours * 60), m = function (x) { return ((x % 1440) + 1440) % 1440; };
        var one = m(c - b) <= m(a - d), st = one ? a : c, end = one ? Math.max(b, a + m(c - a) + (d - c)) : Math.max(d, c + m(a - c) + (b - a));
        r.second = null; r.bedtime = hm(st); r.hours = Math.min(MAXM, end - st) / 60; settle(r);
      }
      /* Wind-down: every task is a text field with its time. Clicking one offers the suggestions; a pick fills the text, which stays editable */
      if (!r.winddown.length) r.winddown.push({ label: "", at: "" });
      function wdCard() {
        var n = r.winddown.length, w = part("winddown").w;
        var rows = r.winddown.map(function (t, i) {
          return '<div class="sl-row sl-trow"><input class="sl-in sl-tin" data-wdt="' + i + '" data-fk="wdt' + i + '" role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" maxlength="100"' +
            ' aria-label="Wind-down task ' + (i + 1) + '" placeholder="Type a small step before bed" value="' + esc(t.label) + '">' +
            tpBtn('data-wdat="' + i + '" data-fk="wdat' + i + '"', t.at, "Time for " + (t.label || "this task")) +
            '<button type="button" class="sl-x" data-wdel="' + i + '" data-fk="wdel' + i + '" aria-label="Remove ' + esc(t.label || "this task") + '">×</button></div>';
        }).join("");
        var add = n >= WDMAX ? '<span class="sl-note">That is the most for one night. Remove one to add another.</span>'
          : '<button type="button" class="sl-more" data-wdadd="1" data-fk="wdadd">+ Add a task</button>';
        return '<section class="sl-card" style="' + vars("in") + '">' + cardHead("sl", "winddown", null, null, "Small steps before bed, each at its own time. Each one done earns its share of the points.", tipMark("sl-wdt", wdLine(n, w))) +
          '<div class="sl-list">' + rows + "</div>" + add + "</section>";
      }
      function wdBind() {
        el.querySelectorAll("[data-wdt]").forEach(function (f) {
          var i = +f.dataset.wdt, t = r.winddown[i], tb = el.querySelector('[data-wdat="' + i + '"]');
          tpWire(tb, function (v) { t.at = v; MP.changed(); }, t.at || "21:30");
          suggestField(f, function () {
            return MP.WINDDOWN.filter(function (s) { return !r.winddown.some(function (x, k) { return k !== i && same(x.label, s[0]); }); })
              .map(function (s) { return [s[0], "usually " + H.t12(s[1]).replace(":00 ", " ")]; });
          }, function (v) {
            t.label = v; var s = MP.WINDDOWN.filter(function (x) { return x[0] === v; })[0];
            if (s && !t.at) { t.at = s[1]; tpSet(tb, s[1]); }   /* a suggestion brings its usual time when none is set yet */
            MP.changed();
          }, function (v) { t.label = v; MP.changed(); });
        });
        el.querySelectorAll("[data-wdel]").forEach(function (b) {
          b.onclick = function () {
            var i = +b.dataset.wdel, x = r.winddown.splice(i, 1)[0];
            if (!r.winddown.length) r.winddown.push({ label: "", at: "" });
            done(r.winddown.length > 1 || r.winddown[0].label ? "wdel" + Math.min(i, r.winddown.length - 1) : "wdt0");
            if (x.label) toast("sl", "Removed " + x.label, function () { if (r.winddown.length >= WDMAX) return; if (!r.winddown[0].label && r.winddown.length === 1) r.winddown.length = 0; r.winddown.splice(Math.min(i, r.winddown.length), 0, x); done(); });
          };
        });
        var a = el.querySelector("[data-wdadd]");
        if (a) a.onclick = function () { r.winddown.push({ label: "", at: "" }); done("wdt" + (r.winddown.length - 1)); };
      }
      function draw(fk) {
        el.innerHTML = '<div class="sl-wrap"><header class="sl-head"><h1>Sleep</h1><p>Sleep makes 70 of the 100 points. Set what a good night looks like for this person.</p></header>' +
          topCard() + sleepCard() + wdCard() + "</div>";
        bind(); place(); refocus(el, fk);
      }
      function done(fk) { MP.changed(); if (fk !== false) draw(fk); }

      /* live sync while dragging or typing: redraw the svg and the numbers, never the whole step */
      function place() {
        var bed = fromNoon(r.bedtime), d = durM(r), wake = bed + d;
        var blk = el.querySelectorAll(".sl-blk"), hb = el.querySelector('[data-drag="bed"]'), hw = el.querySelector('[data-drag="wake"]');
        var seg = function (node, a, b) { node.style.left = pct(a) + "%"; node.style.width = (pct(b) - pct(a)) + "%"; };
        if (wake <= 1440) { seg(blk[0], bed, wake); blk[1].hidden = true; }
        else { seg(blk[0], bed, 1440); seg(blk[1], 0, wake - 1440); blk[1].hidden = false; }
        hb.style.left = pct(bed) + "%"; hw.style.left = pct(onAxis(wake)) + "%";
        var b12 = H.t12(r.bedtime), w12 = H.t12(r.wake), dl = len(d);
        blk[0].setAttribute("aria-label", "Sleep window, " + b12 + " to " + w12 + ". Left and Right arrows move it 15 minutes.");
        blk[0].setAttribute("aria-valuetext", b12 + " to " + w12 + ", " + dl);
        hb.setAttribute("aria-label", "Bedtime, " + b12 + ". Left and Right arrows change it 15 minutes, the wake time stays.");
        hb.setAttribute("aria-valuetext", b12 + ", " + dl);
        hw.setAttribute("aria-label", "Wake time, " + w12 + ". Left and Right arrows change it 15 minutes, the bedtime stays.");
        hw.setAttribute("aria-valuetext", w12 + ", " + dl);
        if (!r.second) return;
        var b2 = fromNoon(r.second.bedtime), d2 = Math.round(r.second.hours * 60), w2 = b2 + d2;
        var k2 = el.querySelectorAll('[data-drag="blk2"]'), h2b = el.querySelector('[data-drag="bed2"]'), h2w = el.querySelector('[data-drag="wake2"]');
        if (w2 <= 1440) { seg(k2[0], b2, w2); k2[1].hidden = true; }
        else { seg(k2[0], b2, 1440); seg(k2[1], 0, w2 - 1440); k2[1].hidden = false; }
        h2b.style.left = pct(b2) + "%"; h2w.style.left = pct(onAxis(w2)) + "%";
        var sb = H.t12(r.second.bedtime), sw = H.t12(r.second.wake);
        k2[0].setAttribute("aria-label", "Second sleep window, " + sb + " to " + sw + ". Left and Right arrows move it 15 minutes.");
        k2[0].setAttribute("aria-valuetext", sb + " to " + sw + ", " + len(d2));
        h2b.setAttribute("aria-label", "Second bedtime, " + sb + ". Left and Right arrows change it 15 minutes.");
        h2w.setAttribute("aria-label", "Second wake time, " + sw + ". Left and Right arrows change it 15 minutes.");
      }
      function sync(src) {
        settle(r);
        document.getElementById("sl-svg").innerHTML = night(r);
        document.getElementById("sl-leg").innerHTML = legend(r);
        document.getElementById("sl-hl").innerHTML = hoursLine(r);
        var st = document.getElementById("sl-steps"), fk = document.activeElement && st.contains(document.activeElement) ? document.activeElement.dataset.fk : null;
        st.innerHTML = steppers(r); bindSteppers(); if (fk) refocus(st, fk);
        ["bedtime", "wake"].forEach(function (k) { var b = el.querySelector('[data-tk="' + k + '"]'); if (b.dataset.v !== r[k]) tpSet(b, r[k]); });
        if (r.second) {
          ["bedtime", "wake"].forEach(function (k) { var b = el.querySelector('[data-tk2="' + k + '"]'); if (b.dataset.v !== r.second[k]) tpSet(b, r.second[k]); });
          [r, r.second].forEach(function (o, i) {
            var n = i + 1, row = el.querySelectorAll(".sl-win")[i];
            row.querySelector(".sl-sv").innerHTML = hrsHtml(o.hours);
            el.querySelector('[data-w' + n + '="-1"]').disabled = o.hours - .5 < 1; el.querySelector('[data-w' + n + '="1"]').disabled = o.hours + .5 > 8;
          });
          var tl = el.querySelector("#sl-tot"), was = tl.classList.contains("bad");
          if (was !== tooClose(r) || tooClose(r)) { tl.innerHTML = totLine(); tl.classList.toggle("bad", tooClose(r)); wireMerge(); }
        }
        place();
      }
      /* bedtime b (minutes of the day) and duration d (minutes) for the plan */
      /* the window a drag moves: the first (4 to 12 h) or the second (1 to 8 h), by the "2" at the end of its kind */
      function tw(kind) { return /2$/.test(kind) ? { o: r.second, lo: 60, hi: 480 } : r.second ? { o: r, lo: 60, hi: 480 } : { o: r, lo: MINM, hi: MAXM }; }
      var twM = function (t) { return Math.round(t.o.hours * 60); };
      function setWin(b, d, t) {
        t = t || tw("");
        d = Math.min(t.hi, Math.max(t.lo, d));
        var nb = hm(b), changed = nb !== t.o.bedtime || d !== twM(t);
        t.o.bedtime = nb; t.o.hours = d / 60;
        return changed;
      }
      function move(kind, b0, d0, dm) {
        var sn = function (v) { return Math.round(v / Q) * Q; }, d, t = tw(kind), k = kind.replace("2", "");
        if (k === "blk") return setWin(sn(b0 + dm), d0, t);
        if (k === "bed") { d = Math.min(t.hi, Math.max(t.lo, sn(d0 - dm))); return setWin(b0 + d0 - d, d, t); }
        return setWin(b0, sn(d0 + dm), t);
      }
      var pressing = false;
      function dragger(node) {
        var kind = node.dataset.drag;
        node.onpointerdown = function (e) {
          if (e.button !== 0) return;
          e.preventDefault();
          var cap = /^blk/.test(kind) ? el.querySelector('[data-drag="' + kind + '"]') : node;   /* the first block piece is never hidden, so it holds the drag */
          document.getElementById("sl-bar").classList.add("is-ptr");   /* a press focuses it without the keyboard ring */
          pressing = true; cap.focus({ preventScroll: true }); pressing = false;
          cap.setPointerCapture(e.pointerId); cap.classList.add("is-drag");
          var bar = document.getElementById("sl-bar").getBoundingClientRect(), k = NB.W / bar.width * 1440 / NB.w;
          var t = tw(kind), x0 = e.clientX, b0 = mins(t.o.bedtime), d0 = twM(t), moved = false;
          cap.onpointermove = function (ev) { if (move(kind, b0, d0, (ev.clientX - x0) * k)) { moved = true; sync(); } };
          cap.onpointerup = cap.onpointercancel = function () {
            cap.onpointermove = cap.onpointerup = cap.onpointercancel = null;
            cap.classList.remove("is-drag");
            if (moved) MP.changed();
          };
        };
        node.onkeydown = function (e) {
          document.getElementById("sl-bar").classList.remove("is-ptr");
          var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
          e.preventDefault();
          var t = tw(kind);
          if (move(kind, mins(t.o.bedtime), twM(t), d * Q)) { sync(); MP.changed(); }
        };
      }
      function bindSteppers() {
        el.querySelectorAll("[data-st]").forEach(function (b) {
          b.onclick = function () {
            var k = b.dataset.st, c = STP[k], bd = bounds(r, k);
            r[k] = Math.min(bd[1], Math.max(bd[0], +(r[k] + c[0] * +b.dataset.d).toFixed(2)));
            settle(r);   /* a new duration keeps the bedtime and moves the wake time */
            done(b.dataset.fk);
          };
        });
      }
      function bind() {
        bindSteppers();
        el.querySelectorAll("[data-drag]").forEach(dragger);
        var bar = document.getElementById("sl-bar");
        bar.addEventListener("focusin", function () { if (!pressing) bar.classList.remove("is-ptr"); });
        /* split: the target stays, window 2 takes 2 h of it in the afternoon; remove: window 1 gets them back */
        wireMerge();
        el.querySelectorAll("[data-w1],[data-w2]:not([data-w2=merge])").forEach(function (b) { b.onclick = function () {
          var a = b.dataset.w2 || b.dataset.w1, o = b.dataset.w1 ? r : r.second;
          /* a night shift by default: the main sleep after the shift, from 8:00 AM, and a short sleep before the next one at 6:00 PM */
          if (a === "add") { var t = r.hours, two = Math.min(2, t - 2); r.second = { hours: two, bedtime: "18:00" }; r.hours = t - two; r.bedtime = "08:00"; settle(r); if (tooClose(r)) { r.second.bedtime = hm(mins(r.wake) + 180); settle(r); } return done("w2rm"); }
          if (a === "rm") { var tt = totalH(r); r.second = null; r.hours = Math.min(12, Math.max(4, tt)); settle(r); return done("w2add"); }
          o.hours += .5 * +a; settle(r); done(b.dataset.fk);
        }; });
        el.querySelectorAll("[data-tk2]").forEach(function (b) {   /* either time moves the second window, its length stays */
          var k = b.dataset.tk2;
          tpWire(b, function (v) { var m = mins(v); r.second.bedtime = hm(k === "bedtime" ? m : m - Math.round(r.second.hours * 60)); settle(r); done(false); draw(); }, r.second[k]);
        });
        el.querySelectorAll("[data-tk]").forEach(function (b) {   /* either time moves the window, the duration stays */
          var k = b.dataset.tk;
          tpWire(b, function (v) { var m = mins(v); r.bedtime = hm(k === "bedtime" ? m : m - durM(r)); sync(k); MP.changed(); }, r[k]);
        });
        /* moving Starts keeps the picked length, so Ends moves with it */
        var lenOn = function () { var b = el.querySelector('.sl-len[aria-pressed="true"]'); return b ? MP.LENGTHS[+b.dataset.len][1] : null; };
        var paintLens = function () { el.querySelectorAll(".sl-len").forEach(function (b) { b.setAttribute("aria-pressed", MP.endFor(plan.start, MP.LENGTHS[+b.dataset.len][1]) === plan.end); }); };
        el.querySelectorAll("[data-k]").forEach(function (i) { var k = i.dataset.k; i.oninput = function () {
          var keep = k === "start" && i.value ? lenOn() : null;
          plan[k] = i.value;
          if (keep) { plan.end = MP.endFor(plan.start, keep); el.querySelector('[data-k="end"]').value = plan.end; }
          paintLens(); MP.changed(); }; });
        el.querySelectorAll(".sl-len").forEach(function (b) { b.onclick = function () {
          if (!plan.start) return;
          plan.end = MP.endFor(plan.start, MP.LENGTHS[+b.dataset.len][1]); el.querySelector('[data-k="end"]').value = plan.end; paintLens(); MP.changed(); }; });
        wdBind();
      }
      draw();
    },
    /* the host calls this when Next is blocked: mark the field itself */
    flag: function (plan, el) {
      var v = this.valid(plan), q = function (s) { return el.querySelector(s); };
      if (!v) return false;
      var empty = [].filter.call(el.querySelectorAll("[data-wdt]"), function (f) { return !f.value.trim(); })[0];
      var n = /name/.test(v) ? q('[data-k="name"]') : /end date/.test(v) ? q('[data-k="end"]') : /time/.test(v) ? q("[data-wdat].need") : empty || q("[data-wdt]");
      return flagField(n, v);
    },
    valid: function (plan) {
      var r = plan.rhythm, tpl = sleepMode === "template";
      if (!String(plan.name || "").trim()) return tpl ? "Give the template a name." : "Give the plan a name, so the person knows what it is.";
      if (!tpl && plan.start && plan.end && plan.end <= plan.start) return "The end date needs to come after the start date.";
      if (overlap(r)) return "The two sleep windows overlap. Merge them into one, or move one apart.";
      if (tooClose(r)) return "The two sleep windows are less than 1 hour apart. Merge them into one, or move one at least 1 hour away.";
      if (r.second && totalH(r) > 12) return "The two sleep windows come to more than 12 hours. Shorten one.";
      if (r.winddown.length > WDMAX) return "Add up to " + WDMAX + " wind-down tasks.";
      if (r.winddown.some(function (t) { return !String(t.label).trim(); })) return r.winddown.length > 1 ? "Type each wind-down task, or remove the empty one." : "Add at least one wind-down task.";
      if (r.winddown.some(function (t) { return !t.at; })) return "Set a time for every wind-down task.";
      return null;
    }
  };

  /* ---------- Self-care ---------- */
  var bdesc = function (name) { var b = MP.BREATHS.filter(function (x) { return x[0] === name; })[0]; return b ? b[1] : ""; };

  MP.steps.selfcare = {
    title: "Self-care",
    sub: function () { return "30 points"; },
    render: function (el, plan) {
      css("sc");
      var r = plan.rhythm, BMAX = MP.BREATH_MAX, BDEF = ["08:00", "13:30", "21:00"];
      var free = function (list, slots) { var u = list.map(function (x) { return x.at; }); return slots.filter(function (t) { return u.indexOf(t) < 0; })[0] || slots[0]; };
      var minsSel = function (x, i) { return ddBtn('data-bm="' + i + '" data-fk="bm' + i + '"', String(x.mins), x.mins + " min", "Minutes of " + x.name); };
      var wireMins = function (el) {
        el.querySelectorAll("[data-bm]").forEach(function (b) {
          var x = r.breathing[+b.dataset.bm], ms = MP.BREATH_MINS.concat(MP.BREATH_MINS.indexOf(x.mins) < 0 ? [x.mins] : []).sort(function (a, c) { return a - c; });
          ddWire(b, ms.map(function (m) { return [String(m), m + " min"]; }), function (v) { x.mins = +v; done("bm" + b.dataset.bm); });
        });
      };
      var LISTS = function () { r.mood.checks.sort(function (a, b) { return (a.at || "").localeCompare(b.at || ""); });   /* check-ins in the order of the day */
        return {
        br: { p: "sc", id: "br", items: r.breathing, max: BMAX, min: 0, pick: true, noun: "exercise", dupes: true, ph: r.breathing.length ? "Add another exercise" : "Pick a breathing exercise", wire: wireMins,
          name: function (x) { return x.name; }, make: function (l, at) { var b = MP.BREATHS.filter(function (x) { return x[0] === l; })[0]; return { name: l, mins: b ? b[2] : 5, at: at }; }, def: function () { return free(r.breathing, BDEF); },
          sugs: MP.BREATHS.map(function (b) { return [b[0], b[3]]; }), extra: minsSel, empty: "" },
        mood: { p: "sc", id: "mood", items: r.mood.checks, max: 2, min: 1, noun: "check-in", one: "Add another check-in",
          /* named by the part of the day its time falls in, so moving the time renames it */
          name: function (x) { var h = x.at ? +x.at.slice(0, 2) : 12; return (h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening") + " check-in"; },
          make: function (l, at) { return { at: at }; }, def: function () { return free(r.mood.checks, ["07:00", "21:00"]); },
          sugs: [], empty: "" }
      }; };
      /* nothing to choose before the first one: an empty me-time list opens on the swap list's own words */
      function card(key, colour, hint) {
        var k = { br: "breathing", me: "metime", mood: "mood" }[key];
        return '<section class="sc-card" style="' + vars(colour) + '">' + cardHead("sc", k, null, null, hint, tipMark("sc-t-" + key, TIP[key]())) + (key === "me" ? meRow() : tlHtml(LISTS()[key])) + "</section>";
      }
      /* Me-time is one activity: a plain text field with its time. Clicking it offers suggestions; a suggestion only fills the text, which stays editable */
      if (!r.metime.length) r.metime = [{ label: "", at: "18:00" }];
      r.metime.length = 1;
      function meRow() {
        var m = r.metime[0];
        return '<div class="sc-row sc-merow"><input class="sc-in sc-mein" id="me-in" role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" maxlength="80"' +
          ' aria-label="Me-time activity" placeholder="Type an activity that helps them feel happy or calm" value="' + esc(m.label) + '">' +
          tpBtn('data-meat="1" data-fk="meat"', m.at, "Time for me-time") + "</div>";
      }
      function meBind() {
        var f = document.getElementById("me-in"), m = r.metime[0];
        tpWire(el.querySelector("[data-meat]"), function (v) { m.at = v; MP.changed(); }, m.at);
        suggestField(f, function () { return MP.METIME.map(function (x) { return [x[0], "usually " + H.t12(x[1]).replace(":00 ", " ")]; }); },
          function (v) {   /* a picked activity brings its usual time */
            m.label = v; var x = MP.METIME.filter(function (y) { return y[0] === v; })[0];
            if (x) { m.at = x[1]; tpSet(el.querySelector("[data-meat]"), x[1]); }
            MP.changed();
          }, function (v) { m.label = v; MP.changed(); });
      }
      var share = function (n, what) {
        return n > 1 ? '<span class="rt-r">Each ' + what + " done earns 10 ÷ " + n + " = " + num(10 / n) + " points. " + (n === 2 ? "Both" : "All " + n) + " done earns the full 10. One left undone adds nothing.</span>"
          : '<span class="rt-r">Doing it that day earns all 10 points. Skipped, it adds nothing.</span>';
      };
      var TIP = {
        br: function () { return '<b class="rt-h">How the 10 points work</b>' + share(r.breathing.length, "exercise") + '<span class="rt-n">Any of the minutes counts. Its time places it in their day.</span>'; },
        me: function () { return '<b class="rt-h">How the 10 points work</b>' + share(1) + '<span class="rt-n">Its time places it in their day.</span>'; },
        mood: function () { return '<b class="rt-h">How the 10 points work</b>' + share(r.mood.checks.length, "check-in") + '<span class="rt-n">Checking in is what counts. The face they pick never changes the score.</span>'; }
      };
      function draw(fk) {
        var nb = r.breathing.length, nm = r.mood.checks.length;
        el.innerHTML = '<div class="sc-wrap"><header class="sc-head"><h1>Self-care</h1><p>Self-care makes 30 of the 100 points. Small things the person can do every day, each at its own time.</p></header>' +
          card("br", "teal", "Each at its own time. " + (nb > 1 ? "Each one done earns " + num(10 / nb) + " of the 10 points." : "Doing it earns all 10 points.")) +
          card("me", "gold", "One activity a day, at a time that suits them. Doing it earns all 10 points.") +
          card("mood", "pink", "Each at its own time. " + (nm > 1 ? "Each one done earns 5 of the 10 points." : "Checking in earns all 10 points.") + " The face they pick never changes the score.") + "</div>";
        bind(); refocus(el, fk);
      }
      function done(fk) { MP.changed(); draw(fk); }
      function bind() {
        var L = LISTS(); tlBind(el, L.br, done); tlBind(el, L.mood, done); meBind();
      }
      draw();
    },
    flag: function (plan, el) {
      var v = this.valid(plan);
      if (!v) return false;
      return flagField(/me-time/.test(v) ? el.querySelector("#me-in") : /breathing/.test(v) ? el.querySelector("#br-q") : el.querySelector(".rt-tp.need"), v);
    },
    valid: function (plan) {
      var r = plan.rhythm;
      if (!r.breathing.length) return "Add a breathing exercise.";
      if (!r.metime.length || !String(r.metime[0].label || "").trim()) return "Type a me-time activity.";
      if (r.breathing.concat(r.metime, r.mood.checks).some(function (x) { return !x.at; })) return "Set a time for every item.";
      return null;
    }
  };
})();
