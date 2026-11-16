/* Belly breathing from generated frames (frames/belly-*.png, made in Gemini from one image so they line up exactly).
   The frames cross-fade with lung fullness p.e: out at empty, in at full, and mid (if present) in between. */
(function () {
  if (!window.LAB) return;
  var css = document.createElement("style");
  css.textContent = ".fr{position:absolute;inset:0;display:grid;place-items:center}.fr img{position:absolute;width:340px;height:340px;left:-10px;top:10px;object-fit:contain}";
  document.head.appendChild(css);
  function add(id, name, note, keys) {
    LAB.add("belly", {
      id: id, name: name, note: note, bg: "#FFFFFF", ref: id === "frames-face" ? "Edited in Magnific (Nano Banana 2.1) from the Gemini frame" : "Generated in Gemini from the GoodFlip CGM illustrations",
      build: function (stage) {
        stage.innerHTML = '<div class="fr">' + keys.map(function (k) { return '<img alt="" src="/v7/mind/breath-lab/frames/' + k + '.png">'; }).join("") + "</div>";
        return { im: [].slice.call(stage.querySelectorAll("img")) };
      },
      frame: function (s, p) {
        var e = p.reduced ? (p.k === "out" ? 0 : 1) : p.e, n = s.im.length - 1;
        /* ponytail: frame i is fully shown at e = i/n and fades in over the step below it; the base never fades */
        s.im.forEach(function (im, i) { im.style.opacity = i === 0 ? 1 : Math.max(0, Math.min(1, e * n - (i - 1))).toFixed(3); });
      }
    });
  }
  add("frames-2", "Woman, 2 frames", "Two illustrations, belly flat and belly full, softly cross-fade with the breath.", ["belly-out", "belly-in"]);
  add("frames-3", "Woman, 3 frames", "Three illustrations, flat, halfway and full, cross-fade for a smoother swell.", ["belly-out", "belly-mid", "belly-in"]);
  /* Four frames, one pair per phase: in = in-start (flat, air into the nose) to in-end (full); out = out-start (full, lips part, air out) to out-end (flat).
     A canvas blends them by weight so the mix is exact; the first 0.6 s of a phase hands over from the last phase's end frame. */
  var F4 = ["m-in-start", "m-in-end", "m-out-start", "m-out-end"];
  LAB.add("belly", {
    id: "frames-face", name: "Woman, face cues, 4 frames (Magnific)", bg: "#FFFFFF", ref: "Edited in Magnific (Nano Banana 2.1) from the Gemini frame",
    note: "Breathing in, air flows into the nose and the belly fills; breathing out, the lips part, air flows out and the belly settles. Four illustrations blend with the breath.",
    build: function (stage) {
      var d = Math.min(2, window.devicePixelRatio || 1), c = document.createElement("canvas");
      c.width = c.height = 340 * d; c.style.cssText = "position:absolute;left:-10px;top:10px;width:340px;height:340px";
      stage.appendChild(c);
      var im = F4.map(function (k) { var i = new Image(); i.src = "/v7/mind/breath-lab/frames/" + k + ".png"; return i; });
      return { x: c.getContext("2d"), c: c, im: im };
    },
    frame: function (s, p) {
      if (!s.im.every(function (i) { return i.complete && i.naturalWidth; })) return;
      var w = [0, 0, 0, 0], inn = p.k !== "out", base = inn ? 0 : 2, f = inn ? p.e : 1 - p.e;
      var a = p.reduced ? 1 : LAB.L.ease(Math.min(1, p.sec / .6));
      if (p.reduced) f = 1;
      w[base] += a * (1 - f); w[base + 1] += a * f;
      w[inn ? 3 : 1] += 1 - a;               /* the previous phase's end frame, fading out */
      var x = s.x, W = s.c.width;
      x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.fillStyle = "#000"; x.fillRect(0, 0, W, W);
      x.globalCompositeOperation = "lighter";
      w.forEach(function (v, i) { if (v > .001) { x.globalAlpha = v; x.drawImage(s.im[i], 0, 0, W, W); } });
    }
  });
})();
