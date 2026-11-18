/* The final seven breathing exercises, signed off on 15 Nov 2026. One list for the lab's final page
   (breath-lab/final.html) and the patient's player (mind/variants/breath.js). The spec is breath-lab/FINAL.md.
   Load after lab.js (LAB.PAT: names and timings), final.js and ai-frames.js (the visuals).
   LAB.FINAL[key]:
     name      what the person sees (the same as LAB.PAT[key].name)
     pat       the pattern in short words, for the ready screen
     how       one line: how it goes (the coach portal's MP.BREATHS says the same)
     look      the visual's name, desc what it shows
     assets    files the visual needs, none for the drawn ones
     steps     the patient's "How it works" list, line the done screen's line
     visual()  a LAB variant { bg, build(stage, L), frame(state, p) } on a 320 x 360 stage; p from LAB.at(key, seconds) */
(function () {
  var D = "/v7/mind/breath-lab/";
  /* Belly, Humming Bee and Pursed Lip wear the Mind indigo (frames/indigo-outfit/, 17 Nov 2026): the same woman and frames,
     her clothes recoloured, with a soft indigo glow behind her. The earlier peach frames stay in frames/ai, frames/pursed and video/belly2 */
  var IO = D + "frames/indigo-outfit/";
  LAB.FINAL_ORDER = ["coherent", "sleep", "box", "exhale", "belly", "hum", "pursed"];
  LAB.FINAL = {
    coherent: { pat: "In 5, out 5", how: "In 5 s, out 5 s, 6 breaths a minute",
      look: "Breath clock with bloom", assets: [],
      desc: "A ring cut in two equal halves, 5 s in and 5 s out, with a bead walking it. In the centre a gold flower opens as you breathe in and folds as you breathe out.",
      steps: [["5 s", "Breathe in slowly through your nose"], ["5 s", "Breathe out slowly, the same length"]],
      line: "Breathing six times a minute is the pace where your heart rhythm settles most easily.",
      visual: function () { return LAB.clockBloom("coherent"); } },
    sleep: { pat: "In 4, hold 7, out 8", how: "In 4 s, hold 7 s, out 8 s",
      look: "Breath clock with bloom", assets: [],
      desc: "The same ring cut 4, 7 and 8: solid for breathing, dotted for the hold. The flower opens as you breathe in, stays open while you hold, and folds slowly as you breathe out.",
      steps: [["4 s", "Breathe in quietly through your nose"], ["7 s", "Hold your breath"], ["8 s", "Breathe out slowly through your mouth"]],
      line: "A long breath out tells your body it is safe to slow down. Lie back and let sleep come.",
      visual: function () { return LAB.clockBloom("sleep"); } },
    box: { pat: "In 4, hold 4, out 4, hold 4", how: "In 4 s, hold 4 s, out 4 s, hold 4 s",
      look: "Breath clock with bloom", assets: [],
      desc: "A square, one side for each step: solid for breathing in and out, dotted for each hold. The flower opens as you breathe in, stays open while you hold, folds as you breathe out and rests closed through the second hold.",
      steps: [["4 s", "Breathe in through your nose"], ["4 s", "Hold"], ["4 s", "Breathe out through your mouth"], ["4 s", "Hold"]],
      line: "Holding between breaths steadies your attention. Good before a meeting or a hard conversation.",
      visual: function () { return LAB.clockBloom("box", null, true); } },
    exhale: { pat: "In 4, out 8", how: "In 4 s, out 8 s, no holds",
      look: "Breath clock with bloom", assets: [],
      desc: "The same ring with a short in-arc and an out-arc twice as long, so you can see the out-breath still has room to go. The flower opens fast and folds slowly.",
      steps: [["4 s", "Breathe in through your nose"], ["8 s", "Breathe out slowly, twice as long"]],
      line: "A breath out twice as long as the breath in tells your body it is safe to slow down.",
      visual: function () { return LAB.clockBloom("exhale"); } },
    belly: { pat: "In 4, out 6", how: "In 4 s as the belly rises, out 6 s as it falls",
      look: "Filmed side profile", assets: [IO + "belly-loop.mp4"],
      desc: "The same woman standing, filmed from head to hips. Breathing in for 4 s her belly rises gently and her chin lifts a little; breathing out for 6 s both settle back along the same path. The breath clock goes round her: a shorter arc in, a longer arc out.",
      steps: [["", "One hand on your chest, one on your belly"], ["4 s", "Breathe in so the belly hand rises, the chest stays still"], ["6 s", "Breathe out slowly as the belly falls"]],
      line: "Breathing from the belly uses your diaphragm, the calmest way to breathe.",
      visual: function () { return LAB.clockBloom("belly", Object.assign({ size: 250, glow: true }, LAB.loopBreath(IO + "belly-loop.mp4"))); } },
    hum: { pat: "In 4, hum 7", how: "In 4 s, then hum on the breath out for 7 s",
      look: "Fingers closing the ears, cut at the chest", assets: [IO + "hum-in.png", IO + "hum-hum.png"],
      desc: "The illustrated woman, head, shoulders and arms only (cut at the chest, so the belly is not shown), with her fingers gently closing her ears. Breathing in she sits still; humming, soft sound arcs show by her ears. The same breath clock goes round her: a short arc for breathing in, a longer one for the hum.",
      steps: [["4 s", "Breathe in through your nose"], ["7 s", "Breathe out with a soft, low hum, lips closed"]],
      line: "The gentle hum on the breath out quietens a busy mind before bed.",
      visual: function () { return LAB.clockBloom("hum", Object.assign({ bg: "#FFFFFF", size: 250, glow: true }, LAB.twoFrames(IO + "hum-in.png", IO + "hum-hum.png", LAB.REST && LAB.REST.hum ? IO + "hum-in.png" : null))); } },
    pursed: { pat: "In 2, out 4", how: "In 2 s through the nose, out 4 s through pursed lips, like blowing out a candle",
      look: "Close-up with arrows", assets: [IO + "pursed-in.png", IO + "pursed-out.png", IO + "pursed-rest.png"],
      desc: "A close side profile of the same woman. Breathing in, her head lifts a little and a soft indigo arrow flows into her nose. Breathing out, her lips purse as if blowing out a candle and the arrow flows away from her mouth. The breath clock goes round her: a short arc in, a longer arc out.",
      steps: [["2 s", "Breathe in through your nose"], ["4 s", "Breathe out through pursed lips, like blowing out a candle"]],
      line: "A slow breath out through pursed lips eases breathlessness and slows your breathing down.",
      visual: function () { return LAB.clockBloom("pursed", Object.assign({ size: 240, glow: true }, LAB.twoFrames(IO + "pursed-in.png", IO + "pursed-out.png", LAB.REST && LAB.REST.pursed ? IO + "pursed-rest.png" : null))); } }
  };
  LAB.FINAL_ORDER.forEach(function (k) { LAB.FINAL[k].key = k; LAB.FINAL[k].name = LAB.PAT[k].name; });
  /* the rest after breathing out (lab.js LAB.REST): said in the short pattern, the how line and the steps */
  Object.keys(LAB.REST || {}).forEach(function (k) {
    var f = LAB.FINAL[k], n = LAB.REST[k];
    f.pat += ", rest " + n;
    f.how = f.how.replace(", no holds", "").replace(", 6 breaths a minute", "") + ", rest " + n + " s";
    f.steps.push([n + " s", "Rest and let the breath settle"]);
    if (k === "coherent") f.line = "Slow, even breathing with a short rest is the pace where your heart rhythm settles most easily.";
  });
})();
