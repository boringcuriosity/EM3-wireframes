# Final breathing

Signed off 15 Nov 2026. Seven exercises, no more and no fewer. Live at `/v7/mind/breath-lab/final.html`; the same pictures run in the patient's player (`/v7/mind/index.html`, `mind/variants/breath.js`) and the same names are in the coach portal (`coach-mind/data.js`, `MP.BREATHS`).

One source: `final-list.js` (`LAB.FINAL`, keyed by technique) holds each exercise's look, words and visual; `lab.js` (`LAB.PAT`) holds the names and timings. Change them there and every page follows.

## The seven

Every picture sits on a 320 x 360 stage with the breath clock around it: a gold ring (a square for Box) cut into one segment per phase, solid for breathing, dotted for a hold, with a bead walking it.

| # | Name | Key | Pattern | Visual | Assets | Reduced motion |
|---|---|---|---|---|---|---|
| 1 | Simple Breathing | `coherent` | In 5, out 5 | Ring in two equal halves; a gold flower opens on the breath in and folds on the breath out | none, drawn in SVG | Flower fully open while breathing in, closed while breathing out; ring segment full, bead at its end; changes only when the phase changes |
| 2 | 4-7-8 Breathing | `sleep` | In 4, hold 7, out 8 | Ring cut 4, 7, 8, the hold dotted; the flower stays open through the hold and folds slowly | none | As 1; open through the hold |
| 3 | Box Breathing (4-4-4-4) | `box` | In 4, hold 4, out 4, hold 4 | A square, one side per step, holds dotted; the flower opens, stays open, folds, rests closed through the second hold | none | As 1, on the square |
| 4 | Extended Exhale (2:1) | `exhale` | In 4, out 8 | Short in-arc, out-arc twice as long; the flower opens fast and folds slowly | none | As 1 |
| 5 | Belly Breathing | `belly` | In 4, out 6 | Filmed side profile from head to hips, looping in time with the clock (`LAB.loopBreath`), inside the ring | `video/belly2/breath-loop.mp4` | The video holds still: full breath (4 s) while breathing in, empty (0 s) while breathing out |
| 6 | Humming Bee Breath (Bhramari) | `hum` | In 4, hum 7 | Illustrated woman, thumbs closing the ears and fingers over the eyes (Shanmukhi); the face eases between breathing in and one still hum frame (`LAB.aiPlayer("humFaceOne")`) | `frames/ai/hs-base.png`, `mask-face.png`, `si-0.png`, `si-2.png`, `si-4.png`, `sh-2.png`, and the `si-0-al`, `si-2-al` copies | One still frame per phase, no blending |
| 7 | Pursed Lip Breathing | `pursed` | In 2, out 4 | Close side profile with a gold arrow into the nose, then pursed lips and the arrow away from the mouth; the two pictures cross-fade over 0.6 s (`LAB.twoFrames`) | `frames/pursed/in.png`, `frames/pursed/out.png` | Straight swap at the phase change |

Words under the picture, per phase: "Breathe in" (Through your nose), "Hold" (Keep still), "Breathe out" (its own short line), and for Bhramari "Hum" (A soft, low hum), with the seconds left in the phase.

## Player states

| State | What shows | Controls |
|---|---|---|
| Ready (patient only) | The picture at its first moment, the pattern ("In 5, out 5"), the session length | Start; the time top right opens the length sheet |
| Playing | The picture breathing, the phase word, the seconds left, the session time | Sound on or off, Pause (pause icon) |
| Paused | The picture holds where it stopped | Sound on or off, End, Resume (play icon). End appears only once paused |
| Sound on or off | A square button, always there; a speaker with waves when on, a crossed speaker in grey when off. Starts on | Toggles in place |
| Ended early (patient) | "You breathed for 2 min 10 s" | Keep Breathing, then Save N Min (a minute or more) or End Here |
| Done (patient) | "5 calm minutes" and the exercise's closing line | Do It Again, Back to Mind |

Older plan names (Coherent Breathing (5-5), Sleep Breathing, Box Breathing and others) resolve through `MP.BREATH_ALIAS` in `coach-mind/data.js` and are always shown with today's name. Anything unknown opens as Simple Breathing.
