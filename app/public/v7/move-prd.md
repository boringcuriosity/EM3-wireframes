# Move: the day screen, Momentum, logging and the coach's plan

Draft 1, 5 Nov 2026. For design, dev and product, and for an engineering agent to build from.

- **Source of truth:** the prototype. Every screen, state and sheet in this PRD runs there. Where this file and the prototype disagree, check section 21 first; if it is not listed there, the prototype wins and this file is fixed.
- **Patient app:** `/move/index.html` (the day view), `/move/learn.html` (Learn tab), `/move/trend.html` (Trend tab).
- **Coach portal:** `/v7/coach-exercise-template.html` (the exercise plan builder), `/v7/coach-momentum.html` and `/v7/coach-momentum-day-parts.html` (the coach's view of a patient's Momentum).
- **Docs that sit beside this spec:** `/v7/move-momentum.html` (every case as a live phone), `/move/deck.html` (the concept and the maths), `/move/sandbox-weights-2.html` (the score, live), `/v7/momentum-commentary.html` (the line under the score, every case, and the AI prompt), `/v7/move-steps-cases.html` (steps with Apple Health and Health Connect), `/v7/move-exercise-lists.html` (exercise lists and kcal rates).
- **Code an agent should read first:** `move/momentum.js` (the score), `move/momentum-pick.js` (which line to say, with a self-test: `node move/momentum-pick.js`), `move/plan.js` (cards and steps), `move/log.js` (search and log a workout), `move/tray.js` (logging the coach's plan), `move/player.js` (exercise player), `move/all-exercises.js` (the exercise list data).

The example day throughout is today at 3:40 PM. The coach's plan burns 118 kcal, has 5 small moves and a 10,000 step goal. The person has done Box breathing and Plank to push up, ticked one morning small move and walked 5,080 steps. Their Momentum is 40.

URL flags in this PRD are prototype controls for reaching a case. They are not product features.

---

## 0. Scope at a glance

### In scope

| # | Area | Section |
|---|---|---|
| 1 | The Move day screen: structure and every state | 1, 3 |
| 2 | The Momentum score | 2 |
| 3 | The line under the score, and KAIRA analysis | 4 |
| 4 | Part of the day cards: the coach's plan, small moves, logged workouts | 5 |
| 5 | Logging the coach's plan (the floating bar and review sheet) | 6 |
| 6 | The exercise player | 7 |
| 7 | Search and log a workout | 8 |
| 8 | The steps card, logging steps, Apple Health and Health Connect | 9 |
| 9 | Rest days and "no target" parts | 10 |
| 10 | A user who cannot walk | 11 |
| 11 | Before a plan, and a free user | 12 |
| 12 | Every bottom sheet | 13 |
| 13 | The medal, the date sheet, FlipCoins | 14 |
| 14 | The Learn tab | 15 |
| 15 | The Trend tab, coming soon | 16 |
| 16 | The coach portal (in `v7/move-coach-prd.md`) | 17, 18 |
| 18 | Exercise list and kcal rules | 19 |
| 19 | What the backend needs | 20 |

### Out of scope

| Out | Notes |
|---|---|
| The full Trend tab | The Trend tab is a coming soon screen (section 16). |
| "How did it feel?" (Easy, Difficult) on a coach's exercise | Removed. Ticking sends the exercise to the floating bar (section 6). The old sheet is still in `plan.js` and must not be built. |
| Opening an article on the Learn tab | Article rows do not open yet. |
| Writing step logs back to Apple Health or Health Connect | Logs stay in GoodFlip (section 9). |
| Mind and Eat | Separate PRDs. Eat: `v7/PRD.md`. Mind plan defaults: `v7/coach-mind/mind-plan-defaults.md`. |

---

## 1. The Move day screen

The Move pillar's day view. It answers how much the person moved today, against the coach's plan, and spread through the day. Prototype: `/move/index.html`.

### Structure, top to bottom

| # | Block | What it holds |
|---|---|---|
| 1 | Header | Flame icon, **"Move"**, the tagline **"Keep your body moving"**. On the right the **Earn** chip (coin + "Earn"), which opens the FlipCoins sheet. At 80% or more the medal hangs from under the header (section 14). |
| 2 | Date pill | Back arrow, calendar icon + **"Today"** (opens the date sheet), forward arrow (disabled on today, and back is disabled before the join date). No delta beside the date. |
| 3 | Score | Momentum, drawn as **Cloud Drop** in indigo with the word "Momentum". The whole score is a button ("What is Momentum?") that opens the Momentum sheet. |
| 4 | The line under the score | One short line from fixed sentences, and on a gain a **Learn more** link (section 4). |
| 5 | What shaped your score? | A slim **"Calories burned"** line ("N kcal", no goal, no bar), then three tiles: **Workout** "N of 118 kcal", **Small moves** "N of 5", **Steps** "N of 10,000 steps". |
| 6 | KAIRA card | KAIRA's mark and one fixed line: **"Went for a walk, a swim or a game?** Search and log any workout you did." Button **"Log workout"**. While Health is not connected, a second outline button **"Log steps"**. |
| 7 | Your move plan | Four part of the day cards: Morning, Afternoon, Evening, Night (section 5). |
| 8 | Your steps | The steps card with the Health strip at its foot (section 9). |
| 9 | Bottom nav | Back, Move (active), Trend, Learn. |

Calories burned = coach exercises ticked done + workouts logged + an estimate from steps (section 9.6). It has no target, by design: an estimate should not read as a target.

---

## 2. The Momentum score

### What it is

How fully the person did their coach's movement plan today, and how spread through the day it was, out of 100. It starts at 0 each morning and never goes down because of anything the person did not do.

### The formula

```
Workout      = 45 × min(1, kcal burned ÷ kcal the coach planned)
Steps        = 25 × min(1, steps so far ÷ steps goal)
Small moves  = 15 × small moves ticked ÷ small moves planned
Moving all day (Spread) = 15 × min(parts moved in, 4) ÷ 4      (3.75 per part)
Momentum = round(sum × SCALE)
```

- Weights live in one place: `window.MVW = { E: 45, S: 25, N: 15, SP: 15, PARTS: 4 }` (`move/momentum.js`). Every line that quotes a share reads from it (for example "+4%" a part of the day, which is 3.75 rounded).
- **kcal burned** = the kcal of every coach exercise ticked done + every workout logged through search.
- **Caps:** Workout caps at its 45 (extra kcal still counts the part of the day it was done in). Steps cap at the goal. Spread caps at 4 parts.
- **A part of the day is moved in** when it has a coach exercise ticked done, a logged workout, or a small move ticked. **Steps never count toward Spread.**
- **Parts of the day:** Morning 6 AM to 12 PM, Afternoon 12 PM to 4 PM, Evening 4 PM to 8 PM, Night 8 PM to 11 PM. A logged workout belongs to the part its time falls in; anything outside 6 AM to 8 PM, including before 6 AM, counts as Night. The coach can change these times for the whole plan (section 17).
- **Steps** count from midnight to now.
- Doing the session and then sitting all day lands around 54%.

### When a part has no target: the weights re-share

```
ON = { Workout: off.e ? 0 : 45,  Steps: off.s or cannot walk ? 0 : 25,
       Small moves: off.n ? 0 : 15,  Spread: (off.e and off.n) ? 0 : 15 }
SCALE = 100 ÷ (sum of ON)
```

| Coach turned off | Result |
|---|---|
| Workouts and small moves | Steps are the whole score |
| Workouts and steps | Small moves and Spread, half each |
| Small moves and steps | Workout 75, Spread 25 |
| User cannot walk (for good) | Workout 60, small moves 20, Spread 20 |
| All three | No score that day (section 10) |

### Rules

- The score never shows a minus. If it falls (a log removed), it settles at the new number quietly, with no "-N", and the line goes back to the nudge.
- On a gain the score steps up with **"+N%"**. The line waits 2.4 s, then speaks and checks the medal.
- A medal is a day at 80% or more (section 14).

### How it is drawn

Cloud Drop, the same component as Eat's sufficiency, in Move's indigo. At 0% the orbs are empty grey glass and the bubble is pale. On a locked day (before a plan) the number is replaced by a padlock. On a full rest day the score is replaced by cloud and sun art with a rest tag. A free user has no score at all.

---

## 3. Screen states

| State | Prototype flag | What the screen shows |
|---|---|---|
| Day under way | default (3:40 PM) | Score 40, tiles filled, cards with ticks |
| Start of the day | `day=start&now=7` | 0%, "As your day starts fresh…" |
| Before a plan, nothing logged | `state=noplanempty` | Padlock, every card a plain card with a plus, two tiles (Workout, Steps) |
| Before a plan, a walk logged | `state=noplan` | As above with a 30 min walk, 129 kcal |
| Free user | `state=free` | No score, a workout diary |
| Free user, nothing logged | `state=freeempty` | No score, steps start at 0 |
| A coach part off | `off=e`, `off=n`, `off=s`, combinations | Section 10 |
| Full rest day | `off=e,n,s` | No score, section 10 |
| Cannot walk | `able=nowalk` | Section 11 |
| Health not connected | `health=off` | Steps from logs only, the strip asks to connect |
| Android | `os=android` | Health Connect words everywhere |
| A past day | from the date sheet | The score the day ended on, "This day ended at X% Momentum." |
| Whole example days | `day=first`, `plan`, `walk`, `half`, `morning`, `gym`, `swap`, `active`, `sick`, `nearly`, `medal` … | See `move/cases.js` and `/v7/move-momentum.html` |

---

## 4. The line under the score

Written by the app from fixed sentences, never by the AI. Only the % and the case change. Code: `move/momentum-pick.js` (pure, self-tested) and `move/momentum.js`.

### Before anything new

| Case | Line |
|---|---|
| Start of the day, 0% | **As your day starts fresh, log every move to keep your Momentum growing.** |
| Back later, nothing new | **Keep moving through the day to grow your Momentum.** |
| Workouts off | No workout target today. Your small moves and steps still grow your Momentum. |
| Small moves off | No small moves today. Your workout and steps still grow your Momentum. |
| Steps off | No step target today. Your workout and small moves still grow your Momentum. |
| Workouts and small moves off | No workout target or small moves today. Your steps are all that count. |
| Workouts and steps off | No workout or step target today. Your small moves are all that count. |
| Small moves and steps off | No small moves or step target today. Your workout is all that counts. |
| All three off | Nothing to track today, so there’s no score. Rest well. |
| Before a plan | Your Momentum score unlocks after your first Move Coach consultation, once your coach assigns you a plan. |
| A past day | This day ended at X% Momentum. |

### After a gain (first match wins)

| # | Case | Line |
|---|---|---|
| 1 | Reached 100% | **You reached 100% Momentum!** You moved well all through the day. |
| 2 | Crossed 80% | **You’ve earned today’s medal!** Your Momentum went up by +X%. Well done. |
| 3 | Already 80% or more | **Your Momentum went up by +X%.** You’re having a great day, keep it going. |
| 4 | One workout log took kcal from under half to past the plan | **Great workout! Your Momentum is up +X%.** Spreading your movement through the day keeps you healthy and strong. |
| 5 | A workout log took kcal past the plan | **Great effort! Your Momentum is up +X%.** Spreading your workout through the day keeps it growing. |
| 6 | First log of the day | **Nice start! Your Momentum is up +X%.** Keep logging your movement to see your score grow. |
| 7 | Steps only | **Your steps added +X%.** Every step you take is moving you forward. |
| 8 | Anything else | **Your Momentum went up by +X%.** Every move you log keeps your score growing. |
| – | A workout logged that adds nothing, kcal already met | **Great effort, you’ve reached today’s workout goal!** Spreading your workout through the day keeps your Momentum growing. |

Rules: a gain under one point leaves the line as it was. Changes inside the 2.4 s wait are said as one gain. On a rest day, a walk logged while workouts are off is a "first" line, never "past the plan". Never a minus.

### Learn more → KAIRA analysis

- **Learn more** sits after a gain line only. It opens the sheet **"KAIRA analysis"**: a shimmer with "KAIRA is looking at your day…", then a short note, then **"Got it"**.
- The note is written by AI from facts the app sends: the score before and now, where the change came from, the medal state, and the best next steps with the score each would reach. **The AI never computes numbers.**
- Shape: a bold opening (shown as the title), a short paragraph, "What helps next" (at most 2 points), a closing line. Gains like +X% render as green tags.
- **Checks before showing:** every % is one the app sent, every change is signed, no minus, no dash inside a sentence, no jargon (kcal, points, "parts of the day"), under 95 words. Fail: retry once, then show the app's own template note (`move/say-kaira.js after()`).
- Prompt: `/v7/momentum-ai-prompt.txt`. Samples: `/v7/data/momentum-ai-samples.json`.
- Never suggest steps or a walk on a no-steps day or to a user who cannot walk.

The KAIRA card on the screen (block 6) always says the same thing. The line under the score carries the insight.

---

## 5. Part of the day cards

One card per part of the day: Morning, Afternoon, Evening, Night, in that order.

### An empty part (nothing planned, nothing logged)

A plain card: name and window ("Night", "8 PM to 11 PM") and a plus at the top right ("Log a workout in the night"), which opens search and log. No scene.

### A part with anything in it

- A quiet illustrated scene behind the header, one per part of the day.
- Header: the name, then "6 AM to 12 PM · 46 min" (minutes only when the coach set exercises), and a **"Movement breakdown"** chip that opens the part's sheet (section 13).
- **"Your coach's plan"**: one row per coach exercise: tick circle, thumbnail with a play mark, the name with "2 sets · 10 reps · 30 kcal", a chevron.
  - Thumbnail: opens the player full screen, turned to landscape, playing.
  - Name or chevron: opens the player upright, **paused** on the first frame.
  - Tick: section 6.
- **"You logged"** (or **"You also logged"** when the coach set exercises): workouts the person logged here, each "Walking", "30 min · 129 kcal", with a dots button. The row opens its menu (section 13).
- **"Did any workout?"** (or **"Did another workout?"** when the coach set one) with a full width **"Search and log exercise"** box. It logs into this part of the day by default; the time picked decides the part on save.
- **"Small moves"**: the coach's small moves, each a tick, a title and a line on why it helps. Ticking plays a pop, a check and a small burst. Unticking asks first (section 13).

**Once a workout is logged into an empty part, that card becomes a full card** with its scene, the logged row and the "Did any workout?" box, and the corner plus goes.

---

## 6. Logging the coach's plan

- Ticking a not-done exercise **does not log it straight away.** It rises into a floating bar at the foot of the screen: the names, **"Edit time"**, a **"Log"** (or "N workouts") button, and an X that reveals **"Remove"** (hides again after 4 s). Waiting rows show an outline tick.
- **Log** plays the win moment, then marks the rows done with a burst.
- The default time is now if the part of the day is under way, otherwise the middle of its window.
- **A time later than now** cannot be logged: Log opens the review sheet **"Workouts to log"** with a banner: **"Future time"**, **"1 workout is set for later"**, **"You can only log a workout you have already done. Done it? Set it to now."** and a button **"Set it to now, 3:40 PM"**.
- Ticking a done exercise opens its sheet: the name, "Done at 7:10 AM", **"Edit workout time"**, **"Mark workout as not done"** (which asks first).

### The win moment

Not a sheet: a short celebration over the screen. **"Workout logged"** (or "N workouts logged"), then **"added to your Momentum score"** with the real gain. Before a plan: **"Your coach will see this when they build your plan."** Free user: **"It adds to what you moved today."** A workout log that raises the score also shows the FlipCoin toast.

---

## 7. The exercise player

- **From a thumbnail:** full screen, turned to landscape, playing. **From the name or chevron:** upright, paused on the first frame; it plays when the person taps play. The page behind holds still.
- The clip plays once, then **"Watch again"**. Tapping the video shows the controls; they hide after 3 s while playing. Controls: previous, play or pause, next (without marking this one done), a scrub bar (arrow keys move 5 s), full screen and back.
- No video: a still and **"No video for this move yet"**, upright.
- **Landscape:** header with the name, a Done badge and "Morning · 1 of 5 · 2 sets · 10 reps"; a list button opens the routine beside the video. At the end of the clip: **"Watch again"** and **"Done, next exercise"** (or "Next exercise" when done, or "Finish").
- **Upright:** the title with **"Mark as completed"** (or **"Completed"**). **"What to do"**: "Set 1: Do this exercise **10 times**", "Between sets: Rest for **30 seconds**", "Set 2: Do it again, **10 times**", "Before the next exercise: Rest for **15 seconds**". **"About this exercise"**: the description, "Steps to perform", "Do's", "Don'ts". At the foot **"Up next"** with the next name, or **"End of the list"** / "This is the last move in Morning", or **"Nothing left after this"** / "Every other move is done"; **"See all"**; the main button **"Next"** or **"Finish"**.
- **Mark as completed** asks for the time, marks it done and plays the win moment. **Next** on a not-done exercise marks it done now, with no question, and moves to the next open one. **Finish** closes the player and drops the routine's not-done exercises into the floating bar to log together.

---

## 8. Search and log a workout

### Ways in

KAIRA card **"Log workout"**; a card's **"Search and log exercise"**; an empty card's plus; the Earn sheet's button.

### The search screen

- Header: back, **"Log your workout"**, "Today". Field: **"Search & log your workout"** with a clear X.
- Tabs **"Recent"** and **"All workouts"**. It opens on Recent when there are any.
- **Recent:** the person's last workouts, newest first, at most 8, one per name. Tapping one opens at its last duration. Empty: an illustration, **"Start with whatever you did last. No judgement, ever."** and **"Find your workout"** (focuses search).
- **All workouts:** A to Z with sticky letters and an A to Z index on the right edge (empty letters dimmed).
- **Search:** case-insensitive, matches inside the name, the match highlighted. "N workouts". None: **"We could not find "{q}" in our list"** / **"Check the spelling and try again, or search with a different word."**
- The list is section 19's list, exactly.

### The workout screen

- **"How long did you do it?"**: a wheel, **5 to 120 min in steps of 5**. Default 10, or the last duration from Recent.
- **Intensity:** shown only when the workout has more than one option. Optional, starts at **"Select"**. Sheet **"Select intensity"**, "Choose the intensity of the exercise you did", **"Done"**. Not picked: the workout's default rate.
- **Time:** default now (floored to 5 min) from KAIRA; from a card, now if now is inside that part, otherwise the earlier of now and the part's midpoint. Sheet **"When did you do it?"** (hour, minute, AM or PM). A future time: **"You can only log a time that has passed"**, Done disabled. If the time shown is already late: **"That time has not come yet today. Pick a time that has passed."**, Log disabled.
- **Date:** **"Select date"**, Monday first, future days disabled. The row reads "Today", "Yesterday" or "Tue, 4 Nov".
- Button **"Log exercise"** (editing: **"Save changes"**).
- **kcal = MET × 3.5 × body weight in kg ÷ 200 × minutes**, rounded. Example: Walking 30 min = 3.5 × 3.5 × 70 ÷ 200 × 30 = 129 kcal.
- Saved: name, icon, minutes, kcal, time, intensity. It is filed under the part of the day its time falls in, not the card it was opened from.

### Edit and remove

The logged row's menu: name, "30 min · 129 kcal", **"Edit workout"**, **"Remove workout"**.
- **Edit** opens the workout screen filled in, **"Save changes"**. It re-files under its new part of the day. The score moves without a win moment.
- **Remove** asks: **"Remove this workout?"**, "It comes off today's log, and the 129 kcal it burned leave your Momentum score." (before a plan: "It comes off today's log."), **"Remove workout"** / **"Keep it"**.

---

## 9. Steps

### 9.1 The card

- **"Your steps"**, a big **"5,080 of 10,000 steps"** (before a plan or free: "5,080 steps") and **"Log steps"**.
- Line under it: **"4,920 more** to reach today's goal" · **"Goal reached.** Every step from here is extra." · before a plan **"Your coach sets your daily goal after your first consultation."** · free **"Counted by your phone."**
- A progress bar (not before a plan, not free).
- **24 hourly bars**, ticks "12 AM, 6 AM, 12 PM, 6 PM". Hours to come are flat and cannot be tapped.
- Tapping a bar shows a tip over it: **"N steps"**, "3 PM to 4 PM" (", so far" on the current hour). The tip stays inside the card at either end.
- The steps goal comes from the coach's plan for that day (section 17). No default in the plan.

### 9.2 Logged steps: edit and remove from the tip

Each step log is kept as its own entry (steps and time). The phone's steps stay as the platform's hourly totals and are never changed.

- On an hour that has logs, the tip adds a **pencil** ("Edit the steps you logged") and a **bin** ("Remove the steps you logged"). Hours with only phone steps get neither.
- **Pencil:** opens the steps sheet filled in, titled **"Your log"** (or **"Your logs"**), with **"Steps from Apple Health in this hour stay as they are."** Every row has an X ("Remove this log"). No "Add another time". **"Save"** is always on, so removing every row and saving clears them.
- **Bin:** asks: **"Remove this log?"** (or "Remove these logs?"), "{N} steps you logged", **"They come off today's steps, and your Momentum score updates. Steps from Apple Health stay as they are."** (before a plan, without the Momentum clause), **"Remove"** / **"Keep it"**. Removes every log in that hour.

### 9.3 Log steps sheet

- Title **"Log steps"**. Columns **"Steps"** and **"Around"**. Each row: a number field and a time ("3:40 PM"), an X on every row after the first.
- **"+ Add another time"**, up to **6 rows**; a new row copies the last row's time.
- Numbers only, no leading zero, **at most 5 digits** (see the open question on a ceiling).
- Time sheet **"Around what time?"**, **"Set time"**. Later than now: **"That's later than now. Pick a time up to 3:40 PM."**
- **"Save"**, or **"Save N logs"** for more than one row. Disabled until a row has steps.
- Save: each row goes into its own hour, **added on top** of what is there, and becomes its own log. The tip of that hour opens, and the bars grow from where they were.

### 9.4 Apple Health and Health Connect

- **Connected strip** at the card's foot: **"From Apple Health"** (Android **"From Health Connect"**), **"Updated 2 min ago"** or **"Updated just now"**. No sync button: the app reads the store when the screen opens or comes back, and in the background as the OS allows.
- **Not connected:** the strip becomes a button: **"Connect Apple Health"** (Android **"Turn on Health Connect"**), **"Your steps count by themselves"**, a chevron. Steps come only from logs. KAIRA's card gains **"Log steps"**.
- **Connect sheet:** **"Let your phone count your steps"**, "It already keeps them. Connect it once, and every walk counts toward your Momentum without you logging it." Then **"Next, your phone will ask"** with a picture of the real permission screen (Steps, Workouts, Active Energy on, Heart Rate off). **"Connect Apple Health"** (Android **"Allow Health Connect"**) and **"I will log steps manually"**. It opens by itself once, on arrival, while not connected.
- Read the platform's **merged total per hour**; never add raw records together.

### 9.5 Decisions from the steps research (`/v7/move-steps-cases.html`)

| Q | Decision | In the prototype |
|---|---|---|
| Q1 Can a log be changed? | Change in place | Yes (pencil) |
| Q3 What can be removed? | Own logs only | Yes |
| Q4 A log and the phone in the same hour | Add on top, with a hint under the row: "Your phone counted 1,240 steps around then. Log only the steps it missed." | Adds on top, **no hint yet** |
| Q6 Storage | Per entry, shown per hour | Yes |
| Q8 Same weight in the score | Yes, logged steps count the same | Yes |
| Q9 Write back to Health | No, keep them in GoodFlip | Yes |
| Q14 Reading phone steps | The platform's merged total, per hour | n/a |
| Q15 Steps switched off in Settings | Keep what was read | n/a |
| Q2, Q5, Q7, Q10, Q11, Q12, Q13 | See open questions, section 22 | |

### 9.6 Calories from steps

Steps × (height × 0.414) gives distance, then km × kg × 0.5 kcal (ACSM walking). Shown only inside Calories burned, never as a target.

---

## 10. Rest days and parts with no target

The coach can turn off workouts, small moves or steps for a day (section 17). On that day:

- **Score:** the parts that are off sit out and the rest share the 100 (section 2). The person can still reach 100.
- **Tiles:** a part that is off reads **"No target"** (small moves **"None today"**) with **"By your coach"**. Once something is logged there anyway, it shows the number with **"Rest day"** and a bed icon.
- **Strip under the tiles:** a soft gold glow with **"Take it easy today, it’s your rest day"** and an info icon, which opens the rest sheet.
- **Cards:** workouts off removes the coach's exercises; small moves off removes the small moves. **Logging a workout stays open everywhere:** moving on a rest day is never wrong, it is just not asked for.
- **Steps off:** the card keeps everything, with **"No target set for today, so your steps don’t count toward your score."** and no progress bar.
- **All three off:** no score, the heading reads **"What you did today"**, the Small moves tile goes, the line reads **"Nothing to track today, so there’s no score. Rest well."**
- **Rest sheet:** section 13.

---

## 11. A user who cannot walk

Set once by the coach for the whole plan ("User can’t walk", section 17), for a permanent disability. It is not a "no target" day: nothing says "no target".

- No Steps anywhere: no tile, no steps card, no "Log steps", two tiles in the Momentum sheet.
- Steps' 25 re-shares: **Workout 60, Small moves 20, Spread 20**.
- KAIRA's card: **"Did a workout, a swim or a game?** Search and log anything you did."
- Small moves are seated versions.
- KAIRA and the analysis never suggest a walk or steps ("a short workout" instead of "a short walk").
- The Momentum sheet's words are rewritten without steps, and it drops the "no target" section.

---

## 12. Before a plan, and a free user

### Before a plan (a member waiting for the first Move Coach consultation)

- The score is a padlock. Line: **"Your Momentum score unlocks after your first Move Coach consultation, once your coach assigns you a plan."**
- No "What shaped your score?" heading. Two tiles: Workout and Steps.
- Section title **"Your day"**. Every card is a plain card with a plus. No small moves.
- Steps: no goal, **"Your coach sets your daily goal after your first consultation."**
- The win moment says **"Your coach will see this when they build your plan."**
- The date sheet shows dots for days with movement logged and dashed rings for days without; no scores.

### A free user (not on a care program)

- **No score at all**, not even a locked one. A workout diary.
- Section title **"Your day"**. Two tiles. Steps: **"Counted by your phone."**
- Nothing logged yet: steps start at 0.
- After a log: **"Workout logged"**, **"It adds to what you moved today."**

---

## 13. Bottom sheets

### Rules for every sheet

Title at the top left, a filled grey circle X at the top right, **no drag handle**, at most 90% of the screen tall. The backdrop and Escape close it. Motion: smooth eases, no bounce.

| Sheet | Opened from | Contents |
|---|---|---|
| **Momentum** | the score | The score in a bubble (indigo); the three tiles; **"What is Momentum?"**; **"How your score works"**: **Do your workout.** / **Move in every part of the day.** / **Reach your step goal.** / **Tick off your small moves.**; **"Why moving all day matters"**; **"How does keeping your momentum help?"**; **"What if something has no target today?"**; **"Where does your plan come from?"** with the coach card ("Your Move coach", name, **"Message"**). Disclaimer: **"Momentum counts the movement you log and the steps from Health. It does not measure intensity or heart rate."** Before a plan it opens with **"Show us how you move."** (three rows). Full rest day: cloud and sun, "Your coach planned no workout, small moves or steps for today, so there’s no score. Your Momentum starts fresh tomorrow." |
| **Movement breakdown** | a card's chip | The part's name; "Suggested 6 AM to 12 PM · what you moved, against this part of the day’s target"; **"Calories burned"** N kcal, target within 20% either side; **"Small moves"** N of 2; **"What the target means"**: within 20% counts as on target, and burning more never counts against you. |
| **Workouts to log** | the floating bar, a future time | Rows (name, part, sets, kcal, time, bin), the future time banner (section 6), "Total N kcal", **"Log N workouts"**. |
| **When did you do it?** | a time | Hour, minute, AM or PM, **"Done"**, "You can only log a time that has passed". |
| **A done coach exercise** | ticking it | Name, "Done at 7:10 AM", **"Edit workout time"**, **"Mark workout as not done"**. |
| **Mark as not done?** | undoing a tick | "It comes off today's log, and the N kcal it burned leave your Momentum score." **"Mark as not done"** / **"Keep it as done"**. For a small move: "This small move comes off today's log, and what it added to your Momentum score is taken back." |
| **A logged workout** | its row | Section 8. |
| **Log steps / Your log** | Log steps, the tip's pencil | Section 9. |
| **Remove this log?** | the tip's bin | Section 9. |
| **Let your phone count your steps** | the strip, or once on arrival | Section 9. |
| **Your rest day** | the rest strip | Bed art; "Your coach has given you a day off from {parts}. Resting helps your muscles recover and grow stronger." (or "…your body recover." when workouts are not the part off); **"You can still reach 100.** Today your score comes from your {parts on}."; **"Keep moving lightly."**; **"Worked out anyway?** Log it, and it will show in your day." Full rest day: **"No score today.** Your Momentum starts fresh tomorrow." and **"Moved anyway?** Log it…" |
| **KAIRA analysis** | Learn more | Section 4. |
| **Earn FlipCoins** | the Earn chip | Section 14. |
| **Select date** | the date pill | Section 14. |

---

## 14. The medal, the date sheet, FlipCoins

### The medal

At **80% or more** a medal on a ribbon swings in from under the header ("Momentum medal earned today. See it again"). Tapping it replays the celebration. It goes if the score falls back under 80.

### The date sheet

- **"Select date"**. A month on a paper pad, Monday first, from the join month to this month.
- Each day carries a ring: future or before joining, faint and disabled; past with nothing logged, dashed grey; scored, an indigo ring filled to the score (a centre dot at 100); 80 or more, the small medal; before a plan with movement logged, a dot; today, the live Momentum.
- Legend: **"The ring is your Momentum out of 100. A medal is a day at 80% or more."**
- Loading: a shimmer. Error: **"We could not load this month. Check your connection and try again."** and **"Retry"**.
- Tapping a day opens that day.

### FlipCoins

- The **Earn** chip opens **"Earn FlipCoins"**: **"Log your workout daily to earn FlipCoins"**, **"Your current streak:"** with the streak, **"Only workouts logged on the day count towards your streak."**, **"Keep the streak going to earn more"**, a week card (+20) and a month card (+50), "Earned so far from this streak: +N FlipCoins", **"Log your workout →"**.
- A workout logged on the day keeps the streak. **One FlipCoin a day** (see open questions).
- A workout log that raises the score shows the toast **"You have earned FlipCoins"**.

---

## 15. The Learn tab

`/move/learn.html`. No page title; the tab bar says Learn.

- **Articles:** the 3 newest, each with a thumbnail, the title (2 lines) and "8 min read . 24 Dec 25". **"View all"** opens all of them. Rows do not open an article yet.
- **Videos:** the live app's Videos tab, word for word: **Exercise of the week** (full width, "🌟 Exercise of the week"), then **Saved** (only once something is saved), then rows: Breathing, Cardio, Walking, Strength and cardio, Strength & conditioning. Each row has **"See all"**.
- **"Search videos"** sits at the right end of the Videos heading. Its page opens with only the field (**"Search by name, like breathing or lunges"**) and nothing under it. Every word typed must appear in a video's name, section or description; name matches come first. None: **"No videos match "{q}". Try a shorter word."**
- **Detail pages** (View all, See all, Search, Saved) have a back arrow and **no bottom nav**.
- **A video card:** the cover with "N min" and a bookmark; the title with a heart and count (hidden under 10); "Beginner · No equipment"; two lines of description with **"Know more"** set into the second line when it is cut off.
- **Bookmark:** "Saved. Find it under Saved." / "Removed from Saved." **Heart:** +1 to the count. Both play a small press, no bounce.
- **Know more** sheet: the title, "Level · No equipment", the description, "Steps to perform", "Do’s", "Don’ts", and **"Play video"**.
- **Video player:** opens full screen, turned, playing. Back and forward 10 s, play or pause, scrub, full screen. Upright: the description below. At the end: **"Watch again"** and **"Next video"**. **"Up next"** plays through the row (Saved plays through Saved; Exercise of the week has none); **"See all"** lists the row. On the last video: **"End of the row"**.
- The native app keeps saved videos under Bookmarks in its side menu.

---

## 16. The Trend tab: coming soon

`/move/trend.html`. Four glimpse cards dealt in one by one ("Your movement", "How you did", "Where you stand", "When you move"), a gold **"Coming soon"** chip, **"Trends are on the way"**, "Soon you'll see how your Momentum moves, week after week: your workouts, small moves and steps.", and "Keep logging your movement, and your trends will be ready soon." No KAIRA. The motion plays once; tapping the art replays it.

---

## 17. Coach portal: the exercise plan

Specified in its own file: **`v7/move-coach-prd.md`**. The plan list, starting from a template (search and pages), the full screen builder with Save as Draft, the three steps (exercise plan, small moves, steps goal), copying, Preview and Assign with calories by day, and how each setting reaches this screen.

---

## 18. Coach portal: the patient's Momentum

Also in **`v7/move-coach-prd.md`** (section 10).

---

## 19. Exercise list and kcal rules

- **The patient's search list** = the live app's **Select Exercise list, 111 names, exactly as the app shows them**, then every coach exercise the app does not already have: **250** in all. Data: `move/all-exercises.js` (`W`: name, icon, MET; `INT`: intensities; `APP`: the 111).
- **Never shorten, merge, rename or hide the app's 111 names.** Only add coach exercises whose name is not already there. Clean-ups are suggestions, never applied.
- The team sheet "Activity logging - exercise_with_intensity" is used **only** for MET and intensities, looked up by name.
- **MET** comes from the Compendium of Physical Activities, matched to each exercise with a confidence (Exact match, Close match).
- **kcal per minute = MET × 3.5 × body weight in kg ÷ 200.**
- The coach's library is 202 exercises (87 single exercises, 115 sessions).
- Reference: `/v7/move-exercise-lists.html` (tabs: Coach plan 202, Log list 111, Search and log 250).

---

## 20. What the backend needs

| Need | Notes |
|---|---|
| The coach's plan per day | Routines by time of day with exercises (sets, reps, rests, duration, kcal), small moves by part, steps goal, rest day, No Moves Day, No Steps Day, and the plan's part of day times |
| "User can't walk" per patient | For the whole plan |
| Each part's on or off for the day | Drives the re-share |
| Exercise done events | Exercise, time, kcal |
| Logged workouts | Name, minutes, intensity, kcal, time, date; edit and delete |
| Small move ticks | With time |
| Steps per hour from the platform | The platform's merged total |
| Step logs, one row per entry | id, steps, time, created at; edit and delete |
| The person's weight (and height for step kcal) | Replaces the prototype's fixed values |
| Momentum per day, and its parts | For the date sheet, the coach's view and a past day |
| Medal days, the FlipCoin streak | |
| Recent workouts per person | Last 8, with last duration |
| Video data | Including each video's duration (`time_duration`) |
| The AI note | Facts in, a checked note out (section 4) |

---

## 21. Where the prototype differs from this spec

| Prototype | Spec |
|---|---|
| A fixed clock, 3:40 PM | Real time |
| One plan for every day; past days show today's cards | Each day's own plan and logs |
| Body weight 70 kg for workouts, 65 kg and 165 cm for steps, 65 kg in the coach tooltip | The person's weight and height |
| Coach exercises carry fixed kcal | kcal from MET, duration and weight |
| Connect always succeeds; the last read is fixed | The real permission and read times |
| Connecting later adds the phone's day on top of step logs | See open question Q12 |
| A workout logged on a past date is not kept | Kept on that date |
| Saved videos and likes live only in memory | Stored |
| Each video plays a sample clip | The real video |
| The FlipCoin streak is fixed at 3 | Real streak |
| Move began as a copy of Eat; Eat leftovers sit in `move/index.html` | Build Move fresh from this spec, not from that file's Eat parts |
| The "How did it feel?" sheet is still in `plan.js` | Not built (section 0) |

---

## 22. Open questions

Coach portal questions are in `v7/move-coach-prd.md`, section 13.

| # | Question | Notes |
|---|---|---|
| 1 | FlipCoins a day: 1 or 8? | The Earn sheet gives 1; the first look in `/v7/move-momentum.html` promises 8. |
| 2 | Steps: show what was logged | Recommended: the tip splits the hour ("2,230 steps. 230 from Apple Health, 2,000 you logged.") and a line under the chart "You logged 2,000 steps today" opens the list. The prototype has only the pencil and bin. |
| 3 | Steps: a ceiling | Recommended: up to 30,000 a row, a check above 10,000 ("That is a long walk. Save 12,000 steps?"). The prototype allows 99,999. |
| 4 | Steps: a hint when a log meets phone steps in the same hour | Recommended, not built (Q4). |
| 5 | Steps: log into yesterday | Recommended today and yesterday, with "Logging for yesterday" (Q11). |
| 6 | Steps: logs when Health is connected later | Recommended: keep them and say so once (Q12). |
| 7 | Steps: zero on a connected iPhone | Recommended: a gentle check after midday (Q13). |
| 8 | What the coach sees of logged steps | Recommended: "9,400 steps, 2,000 logged by hand" (Q10). |
| 9 | Which Compendium edition is the source | The list page says 2024; code comments say 2011. |
| 10 | Odd intensity names from the team sheet | Walking: "Under 2.0 mph Very Slow", "Snow Blower", "Pushing A Wheelchair", with no brisk walk. Swimming has only treading water. |

---

## 23. Rules everywhere

### Visual

GoodFlip design system tokens only. Move's colour is **indigo**, and only the score and its parts carry it. Page backgrounds are pure white; cards may be tinted. Icons are the system's own.

### Motion

Smooth eases, no springs, no bounce. Motion settles to a light, still end state. Respect reduced motion.

### Copy

Plain, warm British or Indian English. **KAIRA** always in capitals. No em dashes. No "X, not Y" or "no X, no Y" constructions. Title Case on buttons. Never blame, never show a minus. Use the copy in this PRD exactly; change it here first.
