/* Move: the sheet that asks to read steps from Apple Health (Health Connect with ?os=android), before the phone's own
   permission screen. Chosen from v7/move-health-sheet-options.html: A, the screen that comes next, a preview of that
   permission screen with the three it reads switching on, so the real one is no surprise.
   Opens from the steps card's Connect strip, and once by itself on arrival while Health is not connected (?health=off).
   ponytail: Connect stands in for the OS permission and always says yes; a no would leave the strip as it is. */
(function () {
  var P = window.MVPLAN; if (!P || !window.GFOpenSheet) return;
  var Q = new URLSearchParams(location.search);
  var AND = P.android, NAME = AND ? "Health Connect" : "Apple Health";
  var HV = Q.get("hv") || "1";   /* chosen: 1, the next screen as a picture in a phone frame. ?hv=2 the ticked list, ?hv=0 the old faded preview (v7/move-health-preview-options.html) */
  var MARK = AND ? '<span class="tile hc"><img src="/v7/icons/health/health-connect.png" alt=""></span>'
    : '<span class="tile"><img src="/v7/icons/health/apple-health-heart.png" alt=""></span>';
  var T = [];

  /* ?hv=1: the permission screen the phone shows next, drawn at its real size (390 wide, the system's own type and
     spacing) inside a phone, then scaled down, so it reads as a picture of a real screen rather than switches to tap */
  function device() {
    var SB = '<div class="ds-sb"><b>9:41</b><span><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><em></em></span></div>';
    var sw = function (on) { return '<span class="ds-sw' + (on ? " on" : "") + '"></span>'; };
    /* the glyphs each system really uses on this screen (researched): iOS marks every Activity type with an orange flame
       and heart types with a red heart; Health Connect uses monochrome Material icons, a running figure for Activity types and a pulse line for vitals, as Google's own Health Connect images show */
    var G = {
      flame: '<svg viewBox="0 0 24 24"><path fill="#FF6A1A" d="M12.6 2.2c.3 2.2-.7 3.8-1.9 5.4-1.3 1.7-2.8 3.4-2.8 5.9 0 1 .3 1.9.8 2.6-.9-.5-1.6-1.4-1.9-2.4-1.3 1.5-2 3.2-1.9 5 .2 3.1 3.1 5.3 6.9 5.3 4.2 0 7.2-2.6 7.2-6.6 0-3.4-2-5.6-3.6-7.6-1.2-1.6-2.4-3.2-2.8-5.4zM12 21c-1.8 0-3-1-3-2.6 0-1.4.9-2.4 1.8-3.4.3 1 1 1.7 2 2 .1-1.2.6-2.1 1.3-3 .8 1 1.4 2 1.4 3.3 0 2.2-1.4 3.7-3.5 3.7z"/></svg>',
      heart: '<svg viewBox="0 0 24 24"><path fill="#FF2D55" d="M12 21.2 10.6 20C5.4 15.4 2 12.4 2 8.6 2 5.6 4.4 3.2 7.4 3.2c1.7 0 3.4.8 4.6 2.1 1.2-1.3 2.9-2.1 4.6-2.1 3 0 5.4 2.4 5.4 5.4 0 3.8-3.4 6.8-8.6 11.4z"/></svg>',
      run: '<svg viewBox="0 0 24 24"><path fill="#1F1F1F" d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.9 19.4l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>',
      /* current Health Connect (Android 14+) marks every Activity type with an outlined flame; the running figure was the older app */
      fire: '<svg viewBox="0 0 24 24"><path fill="none" stroke="#1F1F1F" stroke-width="1.7" stroke-linejoin="round" d="M12.4 3c.4 2.6-1.1 4.3-2.6 6.1C8.6 10.6 7.2 12.3 7.2 14.6a4.8 4.8 0 0 0 9.6 0c0-2.4-1.3-4.2-2.6-5.8-.2 1.2-.8 2.1-1.7 2.6.3-3-.3-6.1-.1-8.4z"/><path fill="none" stroke="#1F1F1F" stroke-width="1.7" stroke-linejoin="round" d="M12 19.2c-1.2 0-2-.8-2-1.9 0-1 .7-1.8 1.4-2.6.2.7.6 1.1 1.2 1.3.1-.6.4-1.1.8-1.6.5.6.8 1.3.8 2.1 0 1.5-.9 2.7-2.2 2.7z"/></svg>',
      pulse: '<svg viewBox="0 0 24 24"><path fill="none" stroke="#1F1F1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 12h4l2.5-6 4 13 2.5-7H22"/></svg>'
    };
    /* what Move reads, most important first: steps, then workouts, then energy; heart rate is not asked for, so it sits last and off */
    var row = function (ic, n, on) { return '<div class="ds-row"><span class="ds-ic">' + G[ic] + '</span><span class="ds-n">' + n + '</span>' + sw(on) + '</div>'; };
    /* the two apps side by side, as iOS 17's Health Access opens (Health ⇄ the app); GoodFlip's store icon is its mark on white */
    var GFI = '<span class="ds-app gf"><img src="/v7/icons/goodflip-logo-small.png" alt=""></span>';
    var LINK = '<span class="ds-lk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h15l-4-4M20 15H5l4 4"/></svg></span>';
    var PAIR = function (other) { return '<div class="ds-pair">' + other + LINK + GFI + '</div>'; };
    var scr = AND
      ? SB + '<div class="ds-and">' + PAIR('<span class="ds-app hc"><img src="/v7/icons/health/health-connect.png" alt=""></span>') +
          '<h3>Allow GoodFlip to access Health Connect?</h3><p>Choose data that you want this app to read from Health Connect</p>' +
          '<div class="ds-h">Allow “GoodFlip” to read</div>' + row("run", "Steps", 1) + row("run", "Exercise", 1) + row("run", "Active calories burned", 1) + row("pulse", "Heart rate", 0) + '</div>'
      : SB + '<div class="ds-ios"><div class="ds-nav"><span>Don’t Allow</span><b>Health Access</b><span>Allow</span></div>' + PAIR('<span class="ds-app ah"><img src="/v7/icons/health/apple-health-heart.png" alt=""></span>') +
          '<p class="ds-lead">“GoodFlip” would like to access and update your Health data.</p>' +
          '<div class="ds-h">Allow “GoodFlip” to read</div><div class="ds-grp">' + row("flame", "Steps", 1) + row("flame", "Workouts", 1) + row("flame", "Active Energy", 1) + row("heart", "Heart Rate", 0) + '</div></div>';
    return '<div class="dev-wrap" aria-hidden="true"><div class="flab">Next, your phone will ask</div>' +
      '<div class="dev' + (AND ? " and" : "") + '"><span class="dev-cam"></span><div class="dev-scr"><div class="ds">' + scr + '</div></div></div></div>';
  }

  function open() {
    T.forEach(clearTimeout); T = [];
    var el = window.GFOpenSheet("mvHealth", "Let your phone count your steps",
      '<p class="hsub">It already keeps them. Connect it once, and every walk counts toward your Momentum without you logging it.</p>' +
      (HV === "2"
        /* ?hv=2: what it reads, as plain ticked facts, no system look at all */
        ? '<div class="reads"><div class="app">' + MARK + '<b>' + NAME + '</b></div><div class="rlab">We\u2019ll read</div>' +
            ['Steps', 'Workouts', 'Active energy'].map(function (n) { return '<div class="rl"><span class="ck"></span>' + n + '</div>'; }).join('') + '</div>'
        : HV === "1" ? device()
        : '<div class="peek' + (AND ? " hc-ui" : "") + '" aria-hidden="true">' +
            '<div class="app">' + MARK + '<b>' + NAME + '</b></div>' +
            '<div class="rows"><div class="row">Steps<span class="tg"></span></div><div class="row">Workouts<span class="tg"></span></div>' +
              '<div class="row">Active energy<span class="tg"></span></div><div class="row off">Heart rate<span class="tg"></span></div></div>' +
          '</div>') +
      '<div class="hft"><button class="hgo" data-h="go">' + (AND ? "Allow Health Connect" : "Connect Apple Health") + '</button>' +
        '<button class="hlater" data-h="later">I will log steps manually</button></div>');
    /* the three it reads switch on one after another, once the sheet has landed */
    if (!HV) [].forEach.call(el.querySelectorAll(".row:not(.off) .tg"), function (t, i) { T.push(setTimeout(function () { t.classList.add("y"); }, 700 + i * 320)); });
  }
  window.openHealth = open;

  document.addEventListener("click", function (e) {
    if (e.target.closest('[data-x="health"]')) return open();
    var b = e.target.closest("#mvHealth [data-h]"); if (!b) return;
    window.closeSheets();
    try { sessionStorage.setItem("mvHealthAsked", "1"); } catch (x) {}
    /* the steps the phone already kept come in, and the score moves with them */
    if (b.dataset.h === "go") setTimeout(P.connect, 360);
  });

  /* once, on arrival, while not connected; a case in the doc (?act=) decides for itself */
  var asked = false; try { asked = sessionStorage.getItem("mvHealthAsked") === "1"; } catch (x) {}
  if (!P.health() && !Q.get("act") && !asked) setTimeout(open, 1200);
})();
