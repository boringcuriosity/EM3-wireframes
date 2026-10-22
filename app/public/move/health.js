/* Move: the sheet that asks to read steps from Apple Health (Health Connect with ?os=android), before the phone's own
   permission screen. Chosen from v7/move-health-sheet-options.html: A, the screen that comes next, a preview of that
   permission screen with the three it reads switching on, so the real one is no surprise.
   Opens from the steps card's Connect strip, and once by itself on arrival while Health is not connected (?health=off).
   ponytail: Connect stands in for the OS permission and always says yes; a no would leave the strip as it is. */
(function () {
  var P = window.MVPLAN; if (!P || !window.GFOpenSheet) return;
  var Q = new URLSearchParams(location.search);
  var AND = P.android, NAME = AND ? "Health Connect" : "Apple Health";
  var MARK = AND ? '<span class="tile hc"><img src="/v7/icons/health/health-connect.png" alt=""></span>'
    : '<span class="tile"><img src="/v7/icons/health/apple-health-heart.png" alt=""></span>';
  var T = [];

  function open() {
    T.forEach(clearTimeout); T = [];
    var el = window.GFOpenSheet("mvHealth", "Let your phone count your steps",
      '<p class="hsub">It already keeps them. Connect it once, and every walk counts toward your Momentum without you logging it.</p>' +
      '<div class="peek' + (AND ? " hc-ui" : "") + '" aria-hidden="true">' +
        '<div class="app">' + MARK + '<b>' + NAME + '</b></div>' +
        '<div class="all">' + (AND ? "Allow all" : "Turn On All") + '</div>' +
        '<div class="rows"><div class="row">Steps<span class="tg"></span></div><div class="row">Workouts<span class="tg"></span></div>' +
          '<div class="row">Active energy<span class="tg"></span></div><div class="row off">Heart rate<span class="tg"></span></div></div>' +
      '</div>' +
      '<div class="hft"><button class="hgo" data-h="go">' + (AND ? "Allow Health Connect" : "Connect Apple Health") + '</button>' +
        '<button class="hlater" data-h="later">I will log steps manually</button></div>');
    /* the three it reads switch on one after another, once the sheet has landed */
    [].forEach.call(el.querySelectorAll(".row:not(.off) .tg"), function (t, i) { T.push(setTimeout(function () { t.classList.add("y"); }, 700 + i * 320)); });
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
