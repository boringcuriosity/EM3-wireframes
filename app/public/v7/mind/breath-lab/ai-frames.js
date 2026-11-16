/* AI frame player: every breathing drawn from generated illustrations (frames/ai/*.png, all edits of one base image).
   A phase shows its own frame list, ordered from empty (0) to full (last); the breath's fullness p.e picks a spot
   between two neighbours and the canvas blends them by weight. The first .5 s of a phase hands over from the frame
   the last phase ended on, so face and air change softly. Holds show one still frame and a thin gold ring closing. */
(function () {
  var DIR = "/v7/mind/breath-lab/frames/ai/";
  var L5 = function (p) { return [0, 1, 2, 3, 4].map(function (i) { return p + "-" + i; }); };
  var F = {
    nin: L5("in"), nout: L5("on"), mouth: L5("om"), pursed: L5("op"),
    holdF: ["hold-f"], holdE: ["hold-e"],
    earIn: L5("hi"), earHum: ["hh-0", "hh-1", "hh-2", "hh-3", "hh-4"],
    faceIn: ["si-0", "si-2", "si-4"], faceHum: ["sh-0", "sh-2", "sh-4"]
  };
  /* which frames each phase of each breathing uses, in the order of LAB.PAT[tech].seq */
  var SPEC = {
    coherent: [F.nin, F.nout],
    box: [F.nin, F.holdF, F.nout, F.holdE],
    sleep: [F.nin, F.holdF, F.mouth],
    belly: [F.nin, F.mouth],
    hum: [F.earIn, F.earHum],
    humFace: [F.faceIn, F.faceHum],
    humFaceOne: [F.faceIn, ["sh-2"]],   /* final page: the hum holds one still picture */
    exhale: [F.nin, F.nout],
    pursed: [F.nin, F.pursed]
  };
  /* Steady frames: one still base per pose, and only the masked zones (air, lips, belly glow, hum arcs) blend.
     Masks and the aligned copies (*-al) are made offline from the frames themselves. */
  var STEADY = {
    coherent: ["hold-e", "side-nose"], box: ["hold-e", "side-nose"], exhale: ["hold-e", "side-nose"],
    sleep: ["hold-e", "side-mouth"], belly: ["hold-e", "side-mouth"], pursed: ["hold-e", "side-pursed"],
    hum: ["hum-base", "ear"], humFace: ["hs-base", "face"], humFaceOne: ["hs-base", "face"]
  };
  /* *-al copies: si/sh nudged onto the face base, in-* with the base's closed lips */
  var ALIGNED = { "si-0": 1, "si-2": 1, "sh-0": 1, "in-0": 1, "in-1": 1, "in-2": 1, "in-3": 1, "in-4": 1 };
  if (LAB.steady == null) LAB.steady = true;
  var cache = {};
  function img(k) {
    if (!cache[k]) { cache[k] = new Image(); cache[k].src = DIR + k + ".png"; }
    return cache[k];
  }
  /* a mask PNG (white = moves) turned into an alpha canvas, once */
  var masks = {};
  function mask(k) {
    if (masks[k]) return masks[k];
    var m = img("mask-" + k);
    if (!m.complete || !m.naturalWidth) return null;
    var c = document.createElement("canvas"), x = c.getContext("2d");
    c.width = m.naturalWidth; c.height = m.naturalHeight; x.drawImage(m, 0, 0);
    var d = x.getImageData(0, 0, c.width, c.height), a = d.data;
    for (var i = 0; i < a.length; i += 4) { a[i + 3] = a[i]; a[i] = a[i + 1] = a[i + 2] = 255; }
    x.putImageData(d, 0, 0);
    return (masks[k] = c);
  }
  /* weights for a phase list at fullness e: two neighbours */
  function pick(list, e, out, scale) {
    var x = Math.max(0, Math.min(1, e)) * (list.length - 1), i = Math.floor(x), f = x - i;
    out[list[i]] = (out[list[i]] || 0) + scale * (1 - f);
    if (f > 0) out[list[i + 1]] = (out[list[i + 1]] || 0) + scale * f;
  }
  LAB.aiPlayer = function (specKey, tech) {
    var seq = LAB.PAT[tech].seq, phases = SPEC[specKey];
    var st = STEADY[specKey];
    phases.forEach(function (l) { l.forEach(function (k) { img(k); if (ALIGNED[k]) img(k + "-al"); }); });
    img(st[0]); img("mask-" + st[1]);
    return {
      build: function (stage) {
        var d = Math.min(2, window.devicePixelRatio || 1), c = document.createElement("canvas");
        c.width = c.height = 340 * d; c.style.cssText = "position:absolute;left:-10px;top:10px;width:340px;height:340px";
        stage.appendChild(c);
        var o = document.createElement("canvas"); o.width = o.height = c.width;
        return { x: c.getContext("2d"), c: c, o: o.getContext("2d") };
      },
      frame: function (s, p) {
        var all = phases[p.idx].concat(phases[(p.idx + seq.length - 1) % seq.length]);
        if (!all.every(function (k) { var i = img(LAB.steady && ALIGNED[k] ? k + "-al" : k); return i.complete && i.naturalWidth; })) return;
        var w = {}, hold = p.k === "hold", e = p.reduced ? (p.k === "out" ? 0 : 1) : p.e;
        var a = p.reduced ? 1 : LAB.L.ease(Math.min(1, p.sec / .5));
        pick(phases[p.idx], hold ? 0 : e, w, a);
        /* the frame the last phase ended on: full after breathing in, empty after breathing out */
        var pi = (p.idx + seq.length - 1) % seq.length, pk = seq[pi][0], pe = pk === "in" ? 1 : pk === "out" ? 0 : (p.k === "out" ? 1 : 0);
        if (a < 1) pick(phases[pi], pk === "hold" ? 0 : pe, w, 1 - a);
        var W = s.c.width, base = img(st[0]), m = LAB.steady && base.complete && base.naturalWidth && mask(st[1]);
        /* blend the frames additively; with steady frames on, on a side canvas cut to the mask, over the still base */
        var x = m ? s.o : s.x;
        x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.fillStyle = "#000"; x.fillRect(0, 0, W, W);
        x.globalCompositeOperation = "lighter";
        Object.keys(w).forEach(function (k) { if (w[k] > .001) { x.globalAlpha = Math.min(1, w[k]); x.drawImage(img(m && ALIGNED[k] ? k + "-al" : k), 0, 0, W, W); } });
        x.globalAlpha = 1;
        if (m) {
          x.globalCompositeOperation = "destination-in"; x.drawImage(m, 0, 0, W, W);
          x = s.x; x.globalCompositeOperation = "source-over"; x.drawImage(base, 0, 0, W, W); x.drawImage(s.o.canvas, 0, 0);
        }
        x.globalCompositeOperation = "source-over";
        if (hold) {   /* the hold ring: a dotted track and a gold arc closing over the hold */
          var r = W * .44, cx = W / 2, cy = W / 2, t = p.reduced ? 1 : p.t, lw = W / 170;
          x.lineCap = "round"; x.lineWidth = lw; x.strokeStyle = "rgba(243,209,97,.55)"; x.setLineDash([.1, lw * 4]);
          x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
          x.setLineDash([]); x.lineWidth = lw * 1.6; x.strokeStyle = "#E7C144";
          x.beginPath(); x.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(.002, t)); x.stroke();
        }
      }
    };
  };
})();
