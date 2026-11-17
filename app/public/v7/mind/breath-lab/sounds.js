/* Breathing sounds, for coaches to compare (sounds.html). Two approaches, each can be on alone or together:
   1. Cues: a sound shaped like the breath, started as each part begins and lasting the whole part.
      rise   Rise and fall (recommended): a warm, soft pad that glides up through the breath in and down through the
             breath out; a hold keeps the note, barely there; the hum is a low, steady drone.
      bowl   Singing bowl: one soft bowl at the start of each part, higher for in, lower for out, a small chime on a hold.
      wave   Soft wave: a hush like a slow sea that swells on the breath in and settles on the breath out; a hold is quiet.
      count  Counting notes: one soft note a second, stepping up while breathing in and down while breathing out.
   2. Music: a background track that plays under the session, not tied to the breath. A Pixabay track plays once its
      file sits in audio/ (see TRACKS); until then a generated ambient pad stands in, and is labelled so.
   The player (lab.js) is not changed: this page silences LAB.cue and follows each phone's clock itself.
   ponytail: a part paused midway stays silent until the next part begins, enough for a comparison page. */
(function () {
  var ctx = null, out, cueBus, musBus, verb;
  function init() {
    if (ctx) { ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    var comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
    out = ctx.createGain(); out.gain.value = .9; out.connect(comp);
    /* a soft room: a convolver fed a 3 s decaying noise burst */
    verb = ctx.createConvolver(); var len = ctx.sampleRate * 3, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    verb.buffer = b; var vg = ctx.createGain(); vg.gain.value = .35; verb.connect(vg).connect(out);
    cueBus = ctx.createGain(); cueBus.connect(out); cueBus.connect(verb);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(out); musBus.connect(verb);
    ctx.resume();
  }

  /* every cue node, so a pause or a switch can hush them */
  var live = [];
  function keep(n) { live.push(n); n.onended = function () { live.splice(live.indexOf(n), 1); }; return n; }
  function hush() {
    if (!ctx) return; var n = ctx.currentTime;
    cueBus.gain.cancelScheduledValues(n); cueBus.gain.setValueAtTime(cueBus.gain.value, n); cueBus.gain.linearRampToValueAtTime(0, n + .25);
    live.slice().forEach(function (o) { try { o.stop(n + .3); } catch (e) {} });
  }
  function open() { var n = ctx.currentTime; cueBus.gain.cancelScheduledValues(n); cueBus.gain.setValueAtTime(cueBus.gain.value, n); cueBus.gain.linearRampToValueAtTime(1, n + .05); }

  /* gain envelope: soft attack, held, soft release ending at dur */
  function env(g, t, dur, peak, att, rel) {
    att = Math.min(att, dur * .4); rel = Math.min(rel, dur * .5);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + att);
    g.gain.setValueAtTime(peak, t + dur - rel); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  }
  function osc(type, f, t, end) { var o = keep(ctx.createOscillator()); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(end + .1); return o; }

  /* a warm pad: sine and a quiet triangle a few cents apart, through a lowpass; glides f0 to f1, filter c0 to c1 */
  function pad(f0, f1, dur, peak, c0, c1, att, rel) {
    var t = ctx.currentTime + .02, g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.Q.value = .5; lp.frequency.setValueAtTime(c0, t); lp.frequency.exponentialRampToValueAtTime(c1, t + dur);
    env(g, t, dur, peak, att == null ? 1.2 : att, rel == null ? 1.2 : rel); lp.connect(g).connect(cueBus);
    [["sine", 1, 0], ["triangle", .35, 4], ["sine", .25, -5]].forEach(function (v) {
      var o = osc(v[0], f0, t, t + dur), og = ctx.createGain(); og.gain.value = v[1]; o.detune.value = v[2];
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur * .9);
      o.connect(og).connect(lp);
    });
  }
  /* a low hum: a soft sawtooth well filtered, with a sine under it */
  function drone(f, dur, peak) {
    var t = ctx.currentTime + .02, g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 420; lp.Q.value = .7; env(g, t, dur, peak, .8, 1.2); lp.connect(g).connect(cueBus);
    var a = osc("sawtooth", f, t, t + dur), b = osc("sine", f, t, t + dur), ag = ctx.createGain(); ag.gain.value = .25; a.connect(ag).connect(lp); b.connect(lp);
    var lfo = osc("sine", 4.5, t, t + dur), lg = ctx.createGain(); lg.gain.value = 1.5; lfo.connect(lg).connect(a.frequency);   /* a slight living waver */
  }
  /* a singing bowl: a few inharmonic partials with long, uneven decays */
  function bowl(f, peak, decay) {
    var t = ctx.currentTime + .02;
    [[1, 1, 1], [2.76, .35, .6], [5.4, .12, .35], [1.004, .5, 1]].forEach(function (p) {
      var o = osc("sine", f * p[0], t, t + decay * p[2]), g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak * p[1], t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + decay * p[2]);
      o.connect(g).connect(cueBus);
    });
  }
  /* a soft note: sine with a quick bright edge, a kalimba-like pluck */
  function note(f, at, peak) {
    var t = ctx.currentTime + .02 + at, g = ctx.createGain(), o = osc("sine", f, t, t + 1.8), o2 = osc("triangle", f * 2, t, t + .4), g2 = ctx.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + 1.8);
    g2.gain.setValueAtTime(peak * .3, t); g2.gain.exponentialRampToValueAtTime(.0001, t + .25);
    o.connect(g).connect(cueBus); o2.connect(g2).connect(cueBus);
  }
  /* a hush: looped noise through a bandpass whose centre and loudness follow the breath */
  var noiseBuf = null;
  function wave(f0, f1, dur, peak) {
    if (!noiseBuf) {   /* pink-ish noise, 2 s */
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); var d = noiseBuf.getChannelData(0), l = 0;
      for (var i = 0; i < d.length; i++) { l = .97 * l + .03 * (Math.random() * 2 - 1); d[i] = l * 6; }
    }
    var t = ctx.currentTime + .02, s = keep(ctx.createBufferSource()), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; bp.type = "bandpass"; bp.Q.value = .8;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, dur, peak, dur * .45, dur * .45); s.connect(bp).connect(g).connect(cueBus); s.start(t); s.stop(t + dur + .1);
  }

  var F3 = 174.6, C4 = 261.6, C3 = 130.8, SCALE = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
  /* each set: play(k, dur, prevK, hum) as a part begins; done() when the session ends */
  var SETS = {
    rise: { name: "Rise and fall", rec: true, note: "A warm note glides up as you breathe in and down as you breathe out. A hold keeps it, very softly. The hum is a low drone.",
      play: function (k, d, prev, hum) {
        if (k === "in") pad(F3, C4, d, .16, 500, 1500);
        else if (k === "out" && hum) drone(C3, d, .14);
        else if (k === "out") pad(C4, F3, d, .16, 1500, 420);
        else pad(prev === "in" ? C4 : F3, prev === "in" ? C4 : F3, d, .045, 600, 600, 1, 1);
      }, done: function () { bowl(392, .12, 6); } },
    bowl: { name: "Singing bowl", note: "One soft bowl as each part begins: higher to breathe in, lower to breathe out, a small chime to hold. Quiet in between.",
      play: function (k, d, prev, hum) {
        if (k === "in") bowl(293.7, .14, Math.min(8, d + 2));
        else if (k === "out") { bowl(196, .15, Math.min(9, d + 2)); if (hum) drone(C3, d, .08); }
        else bowl(587.3, .05, 3);
      }, done: function () { bowl(293.7, .12, 7); setTimeout(function () { bowl(392, .1, 7); }, 900); } },
    wave: { name: "Soft wave", note: "A hush like a slow sea: it swells as you breathe in and settles as you breathe out. A hold is quiet.",
      play: function (k, d, prev, hum) {
        if (k === "in") wave(350, 1100, d, .22);
        else if (k === "out") { wave(1100, 300, d, .2); if (hum) drone(C3, d, .1); }
      }, done: function () { bowl(392, .1, 6); } },
    count: { name: "Counting notes", note: "One soft note each second, stepping up while you breathe in and down while you breathe out, the same note on a hold.",
      play: function (k, d, prev, hum) {
        var n = Math.max(1, Math.round(d)), i;
        if (k === "in") for (i = 0; i < n; i++) note(SCALE[Math.min(7, i)], i * d / n, .07);
        else if (k === "out" && hum) drone(C3, d, .13);
        else if (k === "out") for (i = 0; i < n; i++) note(SCALE[Math.max(0, Math.min(7, n - 1) - Math.round(i * Math.min(7, n - 1) / Math.max(1, n - 1)))], i * d / n, .06);
        else for (i = 0; i < n; i++) note(prev === "in" ? SCALE[Math.min(7, 3)] : SCALE[0], i * d / n, .025);
      }, done: function () { [0, 2, 4, 5].forEach(function (s, i) { note(SCALE[s], i * .25, .06); }); } },
    none: { name: "No cues", play: function () {}, done: function () {} }
  };

  /* 2. music. Pixabay tracks (Pixabay Content License): drop the file at file to use it */
  var TRACKS = [
    { id: "calm", name: "Breathing Calm", by: "The_Mountain", len: "7:50", file: "audio/breathing-calm.mp3", page: "https://pixabay.com/music/meditationspiritual-breathing-calm-139520/" },
    { id: "coh5", name: "Coherent Breathing (5 Minutes)", by: "Siarhei_Korbut", len: "5:00", file: "audio/coherent-breathing-5.mp3", page: "https://pixabay.com/music/meditationspiritual-coherent-breathing-5-minutes-540688/" },
    { id: "slow", name: "Slow Breathing Calm Instrumental Soundscape", by: "SoundsByAmelia", len: "3:21", file: "audio/slow-breathing-calm.mp3", page: "https://pixabay.com/music/ambient-slow-breathing-calm-instrumental-soundscape-457319/" },
    { id: "zen", name: "Zen Breathing Space", by: "Megis-music", len: "5:42", file: "audio/zen-breathing-space.mp3", page: "https://pixabay.com/music/meditationspiritual-megis-zen-breathing-space-488255/" },
    { id: "calming", name: "Calming Breathing", by: "331music", len: "3:16", file: "audio/calming-breathing.mp3", page: "https://pixabay.com/music/ambient-calming-breathing-595468/" }
  ];
  var BASE = "/v7/mind/breath-lab/";
  TRACKS.forEach(function (t) {   /* is the file there? Vite answers a missing file with the HTML page, so check the type */
    fetch(BASE + t.file, { method: "HEAD" }).then(function (r) { t.ok = r.ok && /^audio\//.test(r.headers.get("content-type") || ""); }).catch(function () { t.ok = false; }).then(function () { if (S.onTracks) S.onTracks(); });
  });

  /* the stand-in: a slow, open chord of soft sines, each voice breathing on its own long cycle */
  var standIn = null, el = null, elSrc = null;
  function startStandIn() {
    if (standIn) return; var t = ctx.currentTime, lp = ctx.createBiquadFilter(), g = ctx.createGain(); standIn = [];
    lp.type = "lowpass"; lp.frequency.value = 900; g.gain.value = .5; lp.connect(g).connect(musBus);
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .04; lg.gain.value = 350; lfo.connect(lg).connect(lp.frequency); lfo.start(); standIn.push(lfo);
    [146.8, 220, 277.2, 329.6, 440].forEach(function (f, i) {   /* D, A, C sharp, E, A: Dmaj9 without the root doubled */
      var o = ctx.createOscillator(), vg = ctx.createGain(), l = ctx.createOscillator(), ll = ctx.createGain();
      o.type = i ? "sine" : "triangle"; o.frequency.value = f; o.detune.value = (i % 2 ? 3 : -3);
      vg.gain.value = .06 / (1 + i * .3); l.frequency.value = .03 + i * .017; ll.gain.value = vg.gain.value * .8;
      l.connect(ll).connect(vg.gain); o.connect(vg).connect(lp); o.start(t); l.start(t); standIn.push(o, l);
    });
  }
  function stopStandIn() { if (!standIn) return; var n = ctx.currentTime; standIn.forEach(function (o) { o.stop(n + 1.6); }); standIn = null; }

  var S = window.SOUNDS = {
    SETS: SETS, TRACKS: TRACKS, cue: "rise", music: "none", musLevel: .7,
    init: init, hush: hush,
    get ctx() { return ctx; }, get live() { return live.length; },
    /* what the music is actually playing: "standin", a track id, or "" */
    playing: "",
    musicOn: function (on) {
      if (!ctx) return;
      var n = ctx.currentTime, want = on && S.music !== "none" ? S.music : "", tr = TRACKS.filter(function (t) { return t.id === want; })[0];
      var src = !want ? "" : want === "standin" || !(tr && tr.ok) ? "standin" : want;
      if (src + S.musLevel === S._was) return; S._was = src + S.musLevel;   /* called every frame: act only on a change */
      musBus.gain.cancelScheduledValues(n); musBus.gain.setValueAtTime(musBus.gain.value, n);
      musBus.gain.linearRampToValueAtTime(src ? S.musLevel : 0, n + (src ? 1.5 : .6));
      if (src === S.playing) return;
      if (S.playing === "standin") stopStandIn();
      if (el && S.playing !== "standin") el.pause();
      if (src === "standin") startStandIn();
      else if (src) {
        if (!el) { el = new Audio(); el.loop = true; el.crossOrigin = "anonymous"; elSrc = ctx.createMediaElementSource(el); elSrc.connect(musBus); }
        if (el.dataset.id !== src) { el.src = BASE + tr.file; el.dataset.id = src; }
        el.play();
      }
      S.playing = src;
    },
    phase: function (k, d, prev, hum) { if (!ctx) return; open(); SETS[S.cue].play(k, d, prev, hum); },
    done: function () { if (!ctx) return; open(); SETS[S.cue].done(); }
  };
  /* the house sound in the real players (variants/breath.js, lab.js's LAB.phone), decided 17 Nov 2026: singing bowl
     cues and Breathing Calm at half level. Still off until the person turns sound on. sounds.html sets LAB.noHouse.
     music(on) is called on every state change (or every frame) and acts only when it flips. */
  var hOn = false;
  S.house = {
    music: function (on) {
      if (on === hOn) return; hOn = on;
      if (on) init(); else if (!ctx) return;
      S.cue = "bowl"; S.music = "calm"; S.musLevel = .5; S.musicOn(on); if (!on) hush();
    },
    phase: function (k, d, hum) { if (!hOn) return; S.cue = "bowl"; S.phase(k, d, null, hum); },
    done: function () { if (!ctx) return; S.cue = "bowl"; S.house.music(false); open(); SETS.bowl.done(); }
  };
})();
