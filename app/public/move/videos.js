/* Move Learn: the video library (Learn > Videos), and the card kit's parts (v7/move-video-cards.html).
   Everything here is the live app's Videos tab, read 22 Oct 2026: the same sections in the same order, the same
   titles (spacing and case tidied), levels, equipment, like counts, covers and descriptions, word for word.
   Covers are the app's own, 712 x 233 (3.06:1), shown whole. The card wears FlipFeed's sticker edge.
   The card says each thing once: minutes on the cover, the title, level and equipment, then two lines of the
   description with Know more set into the second line. Know more opens a sheet with all of it, steps, do's and
   don'ts where the app has them. Bookmark sits on the cover; the heart and its count by the title. Saving adds
   a Saved row at the top (notes/move-videos-like-bookmark.md: the web app has no place to see them again).
   ponytail: minutes are samples until the app reads time_duration (the backend has it, the web drops it), and
   the player plays a sample clip: the app's video links are signed and are not copied. */
(function () {
  var IMG = "/v7/img/move/videos/", RATIO = "712 / 233";
  /* t, level, likes, cover, description. Description markers, as the app writes them: STEPS TO PERFORM, DO's, DON'Ts */
  function v(t, lv, likes, img, d, min) { return { t: t, lv: lv, likes: likes, img: img, d: d, min: min }; }
  var BEGIN = "Beginner endurance workouts help build stamina, improve heart health, and increase overall energy levels when done progressively. Do start slow, focus on steady breathing, maintain proper posture, and take breaks as needed. Do not rush intensity, hold your breath, ignore fatigue signals, or overtrain in the early stages. For a personalized endurance plan and gradual progression suited to your fitness level, connect with your exercise coach. For any queries or ongoing guidance, your coach is there to support you.";
  var DANCE = "Dance workouts are a fun and effective way to improve cardiovascular fitness, burn calories, and enhance coordination while staying consistent with exercise. Do a warm-up before starting, maintain good posture, move at a comfortable pace, and stay hydrated. Do not skip warm-up or cool-down, push through pain, or perform high-impact moves if you have joint issues. For a customized exercise plan and safe progression based on your health goals, connect with your exercise coach. For any queries or guidance, your coach will support you throughout the journey.";
  var LEAN = "Lean muscle development exercises help build and maintain healthy muscle mass, improve strength and endurance, boost metabolism, and support better posture, balance, and overall physical function. Perform each exercise with proper form and controlled movements. Avoid using excessive weights or exercising through pain. If you experience pain, dizziness, or worsening symptoms, stop the exercise and consult your exercise coach or healthcare professional.";

  var WEEK = v("Cat & camel", "Beginner", 37, "cat-camel", "The Cat Camel stretch is a good, gentle mobilization of the spine and works on stretching and strengthening core muscles. It can help with pain of the low or mid back and should only be performed to tolerance.", 5);
  var S = [
    { k: "breathing", h: "Breathing", items: [
      v("Active cycle of breathing technique (ACBT)", "Intermediate", 21, "acbt", "ACBT is one way to help clear sputum from your chest. It is a set of breathing exercises that loosens and moves sputum from your airways. The technique consists of breathing control, deep breathing and huffing. These are repeated in a cycle until your chest feels clear.", 6),
      v("Pursed lip breathing", "Intermediate", 8, "pursed-lip", "Pursed lip breathing helps you manage breathlessness and offers a quick and simple way to slow your breathing rate, making each breath more potent.", 3),
      v("Diaphragmatic breathing", "Beginner", 10, "diaphragmatic", "Diaphragmatic breathing is a breathing exercise that helps strengthen your diaphragm, an important muscle that enables you to breathe.", 4),
      v("Apical breathing", "Beginner", 5, "apical", "By improving air entry, apical breathing aids in the opening up of the upper airways or upper part of the lung.", 4),
      v("Thoracic expansion exercise", "Intermediate", 8, "thoracic", "Thoracic expansion breathing technique is a deep breathing exercise with an emphasis on a slow, controlled inhalation through the nose and arm movement that can open up the ribcage.", 5)
    ] },
    { k: "cardio", h: "Cardio", items: [
      v("Mountain climber", "Intermediate", 184, "mountain-climber", "Mountain climbing is a great exercise for building cardiovascular endurance, core strength and agility. It’s an almost total body workout with just one exercise. You can start the exercise by doing it slowly and then gradually increase the speed maintaining the proper position of the body. Do it for 10-15 repetitions on each side. STEPS TO PERFORM Begin with a push up or plank position on your hands and toes by distributing weight evenly between your hands and legs. Take your right knee towards the chest and then switch by pulling the knee out and bringing the left knee in. Do not raise your hips too high & continue breathing alternately while you change each leg. Repeat this by taking both the knees alternatively in towards the chest and then out. Remember to check your form, maintain head in aligned position. DO’s Distribute weight evenly between your hands and legs. Keep your back flat and engage your abdominal muscles. Keep the shoulder right over the wrist. DON’Ts Do not raise your hips too high. Do not bend your elbows. Back should not be curved or arched.", 4),
      v("Beginner endurance 5", "Intermediate", 3, "series-beginner", BEGIN, 15),
      v("Beginner endurance 4", "Intermediate", 2, "series-beginner", BEGIN, 15),
      v("Beginner endurance 3", "Intermediate", 0, "series-beginner", BEGIN, 12),
      v("Beginner endurance 2", "Intermediate", 2, "series-beginner", BEGIN, 12)
    ] },
    { k: "walking", h: "Walking", items: [
      v("High knee", "Beginner", 193, "high-knee", "High knee exercise activates your quadriceps, hamstrings, calves, glutes and hip flexors helping improve the muscular endurance, balance and coordination in these muscles. When done at high intensity and with bounding or explosive knee drives, they can also improve power in your lower body. STEPS TO PERFORM Stand straight with your feet wide apart. Lift up your one knee towards your chest as much as possible, hold it with your both the hands. Keep the leg straight and knee locked which is down on the floor. Slowly bring it back and do similarly slow and gentle movements with the other knee. DO’s Perform slow and gentle movements. Maintain a straight leg with a locked knee that is positioned on the ground. DON’Ts Do not bend your back while lifting the knee up.", 3),
      v("Shuttle run", "Intermediate", 5, "shuttle-run", "Shuttle runs are a popular classic drill which involves short bursts of speed. The drill helps to develop acceleration, speed and your anaerobic fitness.", 5),
      v("Shuttle walk", "Beginner", 4, "shuttle-walk", "Advantage of the shuttle walking test is that it has a better correlation with peak oxygen uptake and improves cardiovascular health.", 5),
      v("Heel & toe raise", "Beginner", 9, "heel-toe", "Heel & Toe raises will help to maintain integrity of calf muscles.", 3)
    ] },
    { k: "dance", h: "Strength and cardio", items: [6, 5, 4, 3, 2].map(function (n) {
      return v("Dance workout " + n, n === 2 ? "Beginner" : "Intermediate", [4, 2, 1, 1, 1][6 - n], "series-dance", DANCE, 20);
    }) },
    { k: "strength", h: "Strength & conditioning", items: [
      v("Lunges", "Beginner", 190, "lunges", "Lunges are a popular strength training exercise among people wanting to strengthen, sculpt, and tone their bodies, while also improving overall fitness and enhancing athletic performance.", 4),
      v("Lean muscle development 6", "Advanced", 0, "series-lean", LEAN, 18),
      v("Lean muscle development 5", "Advanced", 0, "series-lean", LEAN, 18),
      v("Lean muscle development 4", "Advanced", 0, "series-lean", LEAN, 15),
      v("Lean muscle development 3", "Advanced", 0, "series-lean", LEAN, 15)
    ] }
  ];

  /* the description as the app writes it, cut into what it says and its marked parts */
  function parts(d) {
    var m = d.split(/\s*(STEPS TO PERFORM|DO’s|DON’Ts)\s*/), o = { about: m[0] };
    for (var i = 1; i < m.length; i += 2) o[{ "STEPS TO PERFORM": "steps", "DO’s": "dos", "DON’Ts": "donts" }[m[i]]] = m[i + 1].split(/(?<=\.)\s+(?=[A-Z])/);
    return o;
  }
  var IC = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    mark: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    x: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12"/></svg>'
  };
  var count = function (n) { return n >= 10 ? n : ""; };   /* a few likes reads as none, so small counts stay hidden */
  var lvl = function (x) { return x.lv + " · No equipment"; };
  var ALL = [], SAVED = [];
  function card(x, tag, k) {
    var q = k ? ' data-q="' + k + '"' : "";
    var i = ALL.indexOf(x); if (i < 0) i = ALL.push(x) - 1;
    return '<article class="mvv-card">' +
      '<div class="mvv-cov"><button class="mvv-play" data-play="' + i + '"' + q + ' aria-label="Play ' + x.t + '"><img src="' + IMG + x.img + '.webp" alt="" loading="lazy">' +
      '<span class="mvv-min">' + IC.play + x.min + " min</span></button>" +
      '<button class="mvv-mark" data-mark="' + i + '" aria-pressed="' + (SAVED.indexOf(x) >= 0) + '" aria-label="Save"><span class="mvv-ring"></span>' + IC.mark + "</button></div>" +
      '<div class="mvv-body">' + (tag ? '<span class="mvv-tag"><span aria-hidden="true">🌟</span>' + tag + "</span>" : "") +
      '<div class="mvv-top"><h3>' + x.t + '</h3><button class="mvv-like" data-like="' + i + '" aria-pressed="' + !!x.liked + '" aria-label="Like"><span class="mvv-ring"></span>' + IC.heart + "<span>" + count(x.likes + (x.liked ? 1 : 0)) + "</span></button></div>" +
      '<p class="mvv-lv">' + lvl(x) + "</p>" +
      /* Know more sits inside the second line, over a fade, and only when the words run past two lines */
      '<div class="mvv-dw"><p class="mvv-d">' + parts(x.d).about + '</p><button class="mvv-more" data-more="' + i + '"' + q + '>Know more</button></div></div></article>';
  }
  function section(sec) {
    return '<section class="mvv-sec"><div class="mvv-h"><h2>' + sec.h + '</h2><a class="mvv-all" href="#v-' + sec.k + '">See all' + IC.chev + "</a></div>" +
      '<div class="mvv-rail">' + sec.items.map(function (x) { return card(x, null, sec.k); }).join("") + "</div></section>";
  }
  var savedRow = function () { return SAVED.length ? section({ k: "saved", h: "Saved", items: SAVED.slice().reverse() }) : ""; };
  /* See all: every video in a row, one under another, full width */
  function list(k) {
    var sec = k === "saved" ? { h: "Saved", items: SAVED.slice().reverse() } : S.filter(function (s) { return s.k === k; })[0];
    if (!sec || !sec.items.length) return null;   /* Saved only exists once something is saved: no empty page, back to Learn */
    return { h: sec.h, n: sec.items.length, html: '<div class="mvv"><div class="mvv-vlist">' + sec.items.map(function (x) { return card(x, null, k); }).join("") + "</div></div>" };
  }
  /* a Know more only where the two lines actually cut something off */
  function fit(root) { (root || document).querySelectorAll(".mvv-dw").forEach(function (w) { var p = w.firstChild; w.classList.toggle("cut", p.scrollHeight > p.clientHeight + 1); }); }
  function page() {
    setTimeout(function () { fit(); }, 0);
    return '<div class="mvv"><div class="mvv-week">' + card(WEEK, "Exercise of the week") + '</div><div class="mvv-saved">' + savedRow() + "</div>" + S.map(section).join("") + "</div>";
  }

  /* Know more: the whole description in a sheet. Circle X top right, title top left, no handle, at most 90% tall */
  function about(x, k) {
    var p = parts(x.d), list = function (h, a, tag) { return a ? "<h6>" + h + "</h6><" + tag + ">" + a.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</" + tag + ">" : ""; };
    var sh = document.createElement("div"); sh.className = "mvv-sheet";
    sh.innerHTML = '<div class="mvv-dim"></div><div class="mvv-panel" role="dialog" aria-modal="true" aria-label="' + x.t + '"><div class="mvv-ph"><div><b>' + x.t + "</b><span>" + lvl(x) + '</span></div><button class="mvv-x" aria-label="Close">' + IC.x + "</button></div>" +
      '<div class="mvv-sb"><p>' + p.about + "</p>" + list("Steps to perform", p.steps, "ol") + list("Do’s", p.dos, "ul") + list("Don’ts", p.donts, "ul") + "</div>" +
      '<div class="mvv-sf"><button class="mvv-go" data-play="' + ALL.indexOf(x) + '"' + (k ? ' data-q="' + k + '"' : "") + '>' + IC.play + "Play video</button></div></div>";
    document.body.appendChild(sh);
    requestAnimationFrame(function () { sh.classList.add("on"); });
    var close = function () { sh.classList.remove("on"); setTimeout(function () { sh.remove(); }, 300); };
    sh.querySelector(".mvv-dim").onclick = sh.querySelector(".mvv-x").onclick = close;
    sh.querySelector(".mvv-go").addEventListener("click", close);
  }
  /* the system toast, as Move and Eat draw it (move/index.html): top of the screen, light, a tick or a cross on a
     solid disc, one line, nothing to tap. type: "success" (default) or "error" */
  var TICO = {
    success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };
  var tEl, tT;
  function toast(msg, type) {
    type = type === "error" ? "error" : "success";
    if (!tEl) { tEl = document.createElement("div"); tEl.setAttribute("role", "status"); document.body.appendChild(tEl); }
    tEl.className = "toast " + type;
    tEl.innerHTML = '<span class="ti">' + TICO[type] + "</span><span>" + msg + "</span>";
    tEl.classList.remove("on"); void tEl.offsetWidth; tEl.classList.add("on");
    clearTimeout(tT); tT = setTimeout(function () { tEl.classList.remove("on"); }, 3000);
  }
  function anim(sel, on) {
    document.querySelectorAll(sel).forEach(function (l) { l.classList.remove("pop", "out"); void l.offsetWidth; l.classList.add(on ? "pop" : "out"); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-play],[data-like],[data-mark],[data-more]"); if (!b) return;
    var d = b.dataset;
    if (d.play) return window.MVVPLAYER && window.MVVPLAYER.open(ALL[d.play], false, false, queue(d.q, ALL[d.play]));
    if (d.more) return about(ALL[d.more], d.q);
    if (d.like) {
      var x = ALL[d.like]; x.liked = !x.liked;
      /* the same video can sit in two rows (Saved and its own), so every copy changes together */
      anim('[data-like="' + d.like + '"]', x.liked);
      document.querySelectorAll('[data-like="' + d.like + '"]').forEach(function (l) { l.setAttribute("aria-pressed", x.liked); l.querySelector("span:not(.mvv-ring)").textContent = count(x.likes + (x.liked ? 1 : 0)); });
      return;
    }
    var m = ALL[d.mark], k = SAVED.indexOf(m);
    if (k < 0) SAVED.push(m); else SAVED.splice(k, 1);
    document.querySelectorAll('[data-mark="' + d.mark + '"]').forEach(function (l) { l.setAttribute("aria-pressed", k < 0); });
    anim('[data-mark="' + d.mark + '"]', k < 0);
    var host = document.querySelector(".mvv-saved"); if (host) { host.innerHTML = savedRow(); fit(host); }
    toast(k < 0 ? "Saved. Find it under Saved." : "Removed from Saved.");
  });

  var css = '\
.mvv{display:flex;flex-direction:column;gap:32px;padding:20px 0 28px}\
.mvv-saved:empty{display:none}\
.mvv button,.mvv-sheet button{border:0;background:none;padding:0;text-align:left;cursor:pointer;font:inherit;color:inherit;letter-spacing:inherit}\
.mvv-sec{display:flex;flex-direction:column;gap:12px}\
.mvv-h{display:flex;align-items:center;gap:12px;padding:0 var(--gut,16px)}\
.mvv-h h2{flex:1;min-width:0;margin:0;font:600 20px/26px Roboto,sans-serif;letter-spacing:.25px;color:var(--g-900)}\
.mvv-all{display:inline-flex;align-items:center;gap:2px;min-height:32px;font:500 14px/20px Roboto,sans-serif;color:var(--brand-600);text-decoration:none}.mvv-all svg{width:18px;height:18px}\
.mvv-rail{display:flex;gap:16px;overflow-x:auto;padding:2px var(--gut,16px) 8px;scroll-snap-type:x mandatory;scroll-padding-left:var(--gut,16px);scrollbar-width:none;align-items:flex-start}.mvv-rail::-webkit-scrollbar{display:none}\
.mvv-rail>.mvv-card{flex:0 0 296px;scroll-snap-align:start}\
.mvv-week{padding:0 var(--gut,16px)}\
.mvv-vlist{display:flex;flex-direction:column;gap:28px;padding:4px var(--gut,16px) 8px}\
/* the cover: the whole picture at its own 3.06:1, in FlipFeed\'s sticker edge */\
.mvv-cov{position:relative;aspect-ratio:' + RATIO + ';border-radius:10px;border:1px solid var(--in-500,#6172F3);box-shadow:3px 4px 0 var(--in-300,#A4BCFD);background:var(--g-100)}\
.mvv .mvv-play{position:absolute;inset:0;display:block;border-radius:9px;overflow:hidden}\
.mvv-play img{display:block;width:100%;height:100%;object-fit:cover}\
.mvv-min{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 9px 0 7px;border-radius:999px;background:#101828b3;color:#fff;font:600 12px/1 Roboto,sans-serif;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}\
.mvv-min svg{width:12px;height:12px}\
.mvv .mvv-mark::after{content:"";position:absolute;inset:-8px}.mvv .mvv-mark{position:absolute;right:6px;top:6px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;background:linear-gradient(160deg,#3a425680 0%,#10182866 55%,#1d243380 100%);box-shadow:inset 0 1px 1px #ffffff73,inset 0 0 0 .5px #ffffff4d,0 1px 4px #10182826;backdrop-filter:blur(10px) saturate(1.6);-webkit-backdrop-filter:blur(10px) saturate(1.6)}.mvv .mvv-mark::before{content:"";position:absolute;inset:1px 6px auto;height:42%;border-radius:50% 50% 40% 40%;background:linear-gradient(#ffffff40,#ffffff00);pointer-events:none}.mvv .mvv-mark svg{position:relative}.mvv-mark svg{position:relative}.mvv .mvv-mark[aria-pressed=true]{color:#fff}.mvv-mark svg{width:14px;height:14px;fill:none;transition:fill .2s,color .2s}\
.mvv .mvv-mark[aria-pressed=true]{color:#fff}.mvv-mark[aria-pressed=true] svg{fill:currentColor}\
/* the words */\
.mvv-body{display:flex;flex-direction:column;padding:12px 2px 0}\
.mvv-tag{align-self:flex-start;margin-bottom:10px;display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px 0 8px;border-radius:8px;border:1px solid transparent;font:500 12.5px/1 Roboto,sans-serif;letter-spacing:.25px;color:var(--ok-600,#039855);background:linear-gradient(90deg,var(--ok-100,#D1FADF),var(--ok-50,#ECFDF3) 30%,var(--ok-50,#ECFDF3) 70%,var(--ok-100,#D1FADF)) padding-box,conic-gradient(from 180deg,var(--ok-600,#039855),var(--ok-300,#6CE9A6) 25%,var(--ok-300,#6CE9A6) 50%,var(--ok-600,#039855) 75%,var(--ok-300,#6CE9A6)) border-box}.mvv-tag span{font-size:13px}\
.mvv-top{display:flex;align-items:flex-start;gap:8px}\
.mvv-top h3{flex:1;min-width:0;margin:0;font:600 16px/22px Roboto,sans-serif;letter-spacing:.2px;color:var(--g-900)}\
.mvv .mvv-like{position:relative;flex:none;display:inline-flex;align-items:center;gap:3px;height:30px;min-width:30px;justify-content:center;margin:-4px -6px 0 0;padding:0 6px;border-radius:999px;color:var(--g-500);font:500 13px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums}\
.mvv-like svg{width:19px;height:19px;fill:none;transition:fill .2s,color .2s,transform .2s cubic-bezier(.2,.7,.2,1)}\
.mvv-like:active svg{transform:scale(.88)}\
.mvv .mvv-like[aria-pressed=true]{color:#E3405A}.mvv-like[aria-pressed=true] svg{fill:currentColor}\
.mvv-lv{margin:2px 0 0;font:400 13px/18px Roboto,sans-serif;color:var(--g-500)}\
.mvv-dw{position:relative;margin-top:8px}\
.mvv-d{margin:0;font:400 14px/20px Roboto,sans-serif;color:var(--g-700);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\
.mvv .mvv-more{display:none;position:absolute;right:0;bottom:0;padding:0 0 0 36px;font:500 14px/20px Roboto,sans-serif;color:var(--brand-600);background:linear-gradient(90deg,#fff0,#fff 34px)}\
.mvv-dw.cut .mvv-more{display:block}\
/* sheet: Know more */\
.mvv-sheet{position:fixed;inset:0;z-index:60;pointer-events:none}.mvv-sheet.on{pointer-events:auto}\
.mvv-dim{position:absolute;inset:0;background:#10182866;opacity:0;transition:opacity .3s cubic-bezier(.2,.7,.2,1)}.mvv-sheet.on .mvv-dim{opacity:1}\
.mvv-panel{position:absolute;left:50%;bottom:0;width:100%;max-width:var(--col,390px);max-height:90%;display:flex;flex-direction:column;background:#fff;border-radius:24px 24px 0 0;transform:translate(-50%,100%);transition:transform .3s cubic-bezier(.2,.7,.2,1)}\
.mvv-sheet.on .mvv-panel{transform:translate(-50%,0)}\
.mvv-ph{display:flex;align-items:flex-start;gap:12px;padding:20px 16px 12px}.mvv-ph>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}\
.mvv-ph b{font:600 18px/24px Roboto,sans-serif;color:var(--g-900)}.mvv-ph span{font:400 13px/18px Roboto,sans-serif;color:var(--g-500)}\
.mvv-sheet .mvv-x{flex:none;width:36px;height:36px;border-radius:50%;background:var(--g-100);color:var(--g-700);display:grid;place-items:center}.mvv-x svg{width:14px;height:14px}\
.mvv-sb{flex:1;min-height:0;overflow-y:auto;padding:4px 16px 16px;font:400 15px/23px Roboto,sans-serif;color:var(--g-700)}\
.mvv-sb p{margin:0}.mvv-sb h6{margin:18px 0 6px;font:600 14px/20px Roboto,sans-serif;color:var(--g-900)}\
.mvv-sb ol,.mvv-sb ul{margin:0;padding-left:20px}.mvv-sb li{margin-bottom:6px}.mvv-sb li::marker{color:var(--g-400,#98A2B3)}\
.mvv-sf{padding:12px 16px calc(16px + var(--gf-home-h,20px) + env(safe-area-inset-bottom,0px));border-top:1px solid var(--g-100)}\
.mvv-sheet .mvv-go{width:100%;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--brand-600);color:#fff;font:600 16px/1 Roboto,sans-serif;box-shadow:0 4px 0 var(--brand-700,#2A805A)}.mvv-go svg{width:18px;height:18px}\
.toast{position:fixed;left:50%;top:62px;transform:translate(-50%,-12px);width:calc(100% - var(--gut,16px) * 2);max-width:358px;display:flex;align-items:center;gap:10px;padding:12px 16px 12px 12px;border-radius:var(--r-md,12px);background:#fff;color:var(--g-900);border:1px solid var(--g-300,#D0D5DD);font:500 14px/20px Roboto,sans-serif;box-shadow:0 10px 15px -3px rgba(16,24,40,.10),0 4px 6px -4px rgba(16,24,40,.08);opacity:0;pointer-events:none;transition:opacity .24s cubic-bezier(.2,0,0,1),transform .32s cubic-bezier(.16,1,.3,1);z-index:70}\
.toast.on{opacity:1;transform:translate(-50%,0)}.toast span{flex:1;min-width:0}\
.toast.success{background:#ECFDF3;border-color:#039855}.toast.error{background:#FEF3F2;border-color:#D92D20}\
.toast .ti{flex:0 0 auto;display:grid;place-items:center;width:22px;height:22px;border-radius:9999px}.toast.success .ti{background:#039855}.toast.error .ti{background:#D92D20}\
/* on press: the mark swells a little and settles, a faint ring breathes out once; unpressing just settles */\
.mvv-like,.mvv-mark{isolation:isolate}\
.mvv .mvv-mark>*{grid-area:1/1}\
.mvv-like.pop svg,.mvv-mark.pop svg{animation:mvvSwell .42s cubic-bezier(.2,.7,.2,1)}\
.mvv-like.out svg,.mvv-mark.out svg{animation:mvvSettle .28s cubic-bezier(.2,.7,.2,1)}\
@keyframes mvvSwell{0%{transform:scale(.86)}45%{transform:scale(1.2)}100%{transform:scale(1)}}\
@keyframes mvvSettle{0%{transform:scale(.9)}100%{transform:scale(1)}}\
.mvv-ring{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:1.5px solid currentColor;opacity:0;pointer-events:none;z-index:-1}\
.mvv-like .mvv-ring{left:15px}\
.pop>.mvv-ring{animation:mvvRing .5s cubic-bezier(.2,.7,.2,1)}\
@keyframes mvvRing{0%{transform:scale(.5);opacity:.5}100%{transform:scale(1.5);opacity:0}}\
.mvv-like span:not(.mvv-ring){display:inline-block}.mvv-like.pop span:not(.mvv-ring){animation:mvvTick .3s cubic-bezier(.2,.7,.2,1)}\
@keyframes mvvTick{0%{transform:translateY(5px);opacity:0}100%{transform:none;opacity:1}}\
@media (prefers-reduced-motion:reduce){.toast{transition:opacity .2s linear;transform:translate(-50%,0)}.mvv-dim,.mvv-panel,.mvv-like svg{transition:none}.pop svg,.out svg,.pop>.mvv-ring,.mvv-like.pop span{animation:none!important}}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function queue(k, x) {
    if (k === "saved") return { k: k, h: "Saved", items: SAVED.slice().reverse() };
    var sec = S.filter(function (s) { return k ? s.k === k : s.items.indexOf(x) >= 0; })[0];
    return sec ? { k: sec.k, h: sec.h, items: sec.items } : null;
  }
  function find(q) { q = q.toLowerCase(); return [WEEK].concat.apply([WEEK], S.map(function (s) { return s.items; })).filter(function (x) { return x.t.toLowerCase().indexOf(q) >= 0; })[0]; }
  function save(x) { if (x && SAVED.indexOf(x) < 0) SAVED.push(x); }
  function more(x) { if (ALL.indexOf(x) < 0) ALL.push(x); about(x); }
  window.MVV = { queue: queue, find: find, save: save, more: more, page: page, card: card, section: section, list: list, fit: fit, parts: parts, S: S, WEEK: WEEK, IMG: IMG };
})();
