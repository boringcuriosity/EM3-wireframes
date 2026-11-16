# Mind plan, coach portal: defaults and changes for dev

What a new Mind plan starts with when a coach creates it, and every change to the creation flow since the prototype.
Prototype: `/v7/coach-mind-plan.html`. The values live in `/v7/coach-mind/data.js` (`MP.blankPlan`, `MP.LENGTHS`, `MP.endFor`, `MP.defaultName`).

Each change is added to the log at the end with its date.

## 1. Plan name

| | |
|---|---|
| Default | `<Patient's name>'s Mind plan`, the name as the portal shows it, for example **Sahana Chandra's Mind plan** |
| Editable | Yes, a text field. |
| If the coach clears it | Saving or assigning puts the default name back. |
| Applies to | A blank plan and a plan started from a template. A template keeps its own name, and that name is not used for the plan. |

## 2. Dates

| | |
|---|---|
| Start date default | Today, in the coach's local date |
| End date default | 15 days, with the start day counted: today plus 14 days. Starting 5 Nov gives 5 Nov to 19 Nov. |
| Rule | The end date must come after the start date. |

### Quick length chips

A row of chips under the two dates, labelled **Length**: `1 week` · `15 days` · `3 weeks` · `1 month` · `3 months`.

- Tapping a chip sets the end date from the start date. The start date does not change.
- The chip whose length matches the dates on screen shows as selected. On a new plan, that is **15 days**.
- If the coach types an end date that matches no chip, no chip is selected.
- If the coach moves the start date while a chip is selected, the end date moves with it and keeps the same length.

How each length is worked out, with the start day counted:

| Chip | End date | Example, starting 5 Nov |
|---|---|---|
| 1 week | start + 6 days | 11 Nov |
| 15 days (default) | start + 14 days | 19 Nov |
| 3 weeks | start + 20 days | 25 Nov |
| 1 month | same date next month, minus 1 day | 4 Dec |
| 3 months | same date three months on, minus 1 day | 4 Feb |

## 3. Sleep (70 points)

| Field | Default | Limits |
|---|---|---|
| Target sleep in a day | **7.5 hours** | 4 to 12 hours, steps of 0.5 h with the buttons, 15 minutes when dragged |
| Bedtime | **10:30 PM** | Any quarter hour |
| Wake time | **6:00 AM** | Always bedtime plus target duration, so changing one moves the other |
| Wind-down tasks | None, one empty row to fill | Up to 6 |

### Fixed scoring settings

These are fixed scoring settings for every plan. Coaches do not edit them.

| Setting | Value |
|---|---|
| Window allowance, full marks | Within 30 minutes of bedtime and of wake time |
| Window, zero marks | 2 hours off |
| Hours, zero marks | 3 hours short of the target |
| Hours over the target | Up to 1 hour more keeps full marks. Past that, each extra hour loses 20%. |
| Which sleep is judged | The night only: the longest sleep. Naps never change the window or the hours (16 Nov 2026, see the entry at the end) |
| Shortest night for the window | 3 hours asleep. Under that, the window gives 0 |

**Templates:** a template's own sleep values replace these defaults. In the prototype, *Sleep reset, 4 weeks* uses 8 h and 10:00 PM to 6:00 AM, and *Calmer days* uses 11:00 PM to 6:30 AM.

### Wind-down tasks

Each task is **one line of text and one time**. The text can carry the task's length in brackets, but there is no separate duration field. A task given as a range of times uses the first time of the range.

Clicking the text field offers this list, each with its usual time. Picking one fills the text, which stays editable, and sets the time if none is set yet. The coach can also type their own task.

| Task | Usual time |
|---|---|
| Last caffeine (tea, coffee or cola) | 4:00 PM |
| Last alcohol or nicotine | 4:00 PM |
| Evening walk or light movement (20 to 30 min) | 6:30 PM |
| Last heavy meal, dinner cut-off | 7:30 PM |
| Journalling or thought dump (5 to 10 min) | 9:00 PM |
| Last water or fluids | 9:00 PM |
| Screen-free wind-down begins (60 min) | 9:30 PM |
| Gratitude practice, 3 things (3 to 5 min) | 9:30 PM |
| Reading a physical book (20 to 30 min) | 9:30 PM |
| Listen to calming music (15 to 30 min) | 9:45 PM |
| Positive sleep association: prepare the room, dark and at a comfortable temperature | 10:00 PM |

Each task's text is **up to 100 characters**, so every suggestion fits (the longest is 83).

Data: `MP.WINDDOWN`, a list of `[text, "HH:MM"]`. The prototype's sample templates now use these tasks too.

## 4. Self-care (30 points)

| Part | Default |
|---|---|
| Breathing | None. Up to 3 exercises a day. |
| Me-time | One activity a day, empty to fill, at 6:00 PM |
| Mood check-in | **One:** Evening check-in at **9:00 PM**, before wind-down. Up to 2, at least 1. |

### Mood check-in

- A new plan has **one** check-in: **Evening check-in, 9:00 PM**, before wind-down.
- **+ Add another check-in** adds the **Morning check-in, 7:00 AM**, after waking and breathing. The team's times were 7:00 to 7:30 AM and 9:00 to 9:30 PM, so each uses its first time.
- Each check-in is named by the part of the day its time falls in: before 12 PM Morning, 12 to 5 PM Afternoon, from 5 PM Evening. Moving the time renames it.
- They are listed in the order of the day.
- Either can be removed while two are left. With one left, **+ Add another check-in** adds the missing one at its default time.

### Me-time

One activity a day: **one line of text and one time**, like wind-down tasks. Clicking the field offers this list, each with its usual time. Picking one fills the text, which stays editable, and sets the time. The coach can also type their own activity.

| Activity | Usual time |
|---|---|
| Reading books or articles (20 to 30 min) | 7:00 AM |
| Creative hobby: art, craft, music or cooking (20 to 35 min) | 7:00 AM |
| Walk in nature or a park (20 to 30 min) | 7:00 AM |
| Listening to music (15 to 30 min) | 7:00 AM |
| Gentle yoga or stretching (15 to 20 min) | 7:00 AM |
| Gardening or plant care (15 to 20 min) | 7:00 AM |
| Bath or a self-care ritual (10 to 20 min) | 7:00 AM |
| Prayer or spiritual practice (10 to 15 min) | 7:00 AM |
| Mindfulness meditation (10 to 15 min) | 7:00 AM |
| Social connection: call a friend or family (15 to 30 min) | 6:00 PM |
| Dancing or free movement (15 to 30 min) | 6:00 PM |
| Learning something new: a language, skill or course (20 to 30 min) | 6:00 PM |
| Indoor or outdoor games (20 to 30 min) | 6:00 PM |
| Activity of your choice (15 to 20 min) | 6:00 PM |
| Journalling or brain dump (10 to 15 min) | 9:00 PM |
| Screen-free quiet time, just sitting (10 min) | 9:00 PM |

Times from the team's table: "Morning or evening" (and "Anytime, morning or evening") uses its first, **7:00 AM**. "Anytime" uses me-time's default, **6:00 PM**. A range of times uses its first time.

Data: `MP.METIME`, a list of `[text, "HH:MM"]`. The text is up to 80 characters.

### Breathing

The coach picks from these seven exercises. Each comes in with its starting minutes and usual time, and both can be changed.

| Exercise | How it goes | Starting minutes | Usual time |
|---|---|---|---|
| Simple Breathing (coach note: Coherent, 5-5) | In 5 s, out 5 s, 6 breaths a minute | 5 (5 to 10) | 7:00 AM (morning) |
| Box Breathing (4-4-4-4) | In 4 s, hold 4 s, out 4 s, hold 4 s | 5 | 6:30 AM |
| Belly Breathing | In 4 s as the belly rises, out 6 s as it falls | 5 | 7:00 AM (morning or noon) |
| Pursed Lip Breathing | In 2 s through the nose, out 4 s through pursed lips, like blowing out a candle | 2 (2 to 5) | 12:00 PM (noon or when needed) |
| Extended Exhale (2:1) | In 4 s, out 8 s, no holds | 2 (2 to 5) | 12:00 PM (noon, night or when needed) |
| Humming Bee Breath (Bhramari) | In 4 s, then hum on the breath out for 7 s | 5 (5 to 10) | 8:30 PM |
| 4-7-8 Breathing | In 4 s, hold 7 s, out 8 s | 1 (1 to 2) | 9:30 PM |

Rules for turning the team's table into one value each: a range of minutes starts at its lower end, a range of times uses its first time, "Morning" is 7:00 AM and "Noon" is 12:00 PM.

- **Minutes:** any whole minute from **1 to 30**, from a dropdown.
- **Changing an exercise:** its name is a dropdown. Picking another exercise keeps the time and takes the new exercise's starting minutes.
- **Removing:** every exercise has a ×, including the only one. With none left, Next asks for one: "Add a breathing exercise."
- The same exercise can be added twice at different times.

**For dev:** these seven, and only these, are the patient app's breathing player (final since 15 Nov 2026, see the entry at the end). Today's reflection app has five (Sleep, Zen Flow, Star, 5 Finger, Box); Zen Flow, Star and 5 Finger are retired from the player, Sleep Breathing becomes 4-7-8 Breathing and Box becomes Box Breathing (4-4-4-4).

Data: `MP.BREATHS`, a list of `[name, how it goes, starting minutes, "HH:MM", player key, coach note]`; `MP.BREATH_MINS` is 1 to 30. Older saved names resolve through `MP.BREATH_ALIAS` and `MP.breath(name)`.

## 5. Coach's practices (not scored)

None by default. Note to the patient: empty.

The library holds **21 practices** in **8 categories**, as in the team's sheet:

| Category | Practices |
|---|---|
| Restructuring Thoughts | Worry Tree, Reframing Thoughts, Stop and Swap, Problem Solving, Circle of Control |
| Thoughts and worry | 5-4-3-2-1 Grounding |
| Goals and motivation | SMART Goals, Motivation Check-in, Motivation Tracker, Behavior Change Plan, Health Planner, The 20-80 Priority Rule, Habit Tracker |
| Mood and self-kindness | Gratitude Journal, Weekly Mood Diary, Mirror Exercise, Self Love Affirmations |
| Sleep | Sleep Sweep |
| Stress Management (Calming) | 5 Finger Breathing |
| Triggers | Tracking Triggers |
| Eating and triggers | Mindful Eating Quiz |

**Removed** from the reflection app's 27: Sleep Tracker, Sleep Tips, Sleep Breathing, Zen Flow Breathing, Star Breathing, Box Breathing. Breathing is now picked in Self-care, where it is scored. Nothing was added.

The sample template *Sleep reset, 4 weeks* used Sleep Tracker and Sleep Tips, so it now carries only Sleep Sweep.

Data: `MP.THEMES` (the 8 categories, in this order) and `MP.PRACTICES`.

## Text limits

Every text field in the Mind plan has a character limit. When the text reaches it, by typing or pasting, a line appears under the field: "That is the 100 character limit. Anything more will not fit." (with that field's number). It goes away once the text is shorter.

| Field | Limit |
|---|---|
| Wind-down task | 100 |
| Me-time activity | 80 |
| Habit (practices) | 60 |
| Template name | 60 |
| Template about | 120 to 140 |
| Note to the patient | 500 |

## Change log

| Date | Change |
|---|---|
| 16 Nov 2026 | Sleep window judged on the night only: naps and repeated sessions no longer move it, and a night needs 3 hours asleep for the window to count ("16 Nov 2026: which sleep the window judges"). |
| 15 Nov 2026 | Breathing is final: the seven exercises, names, timings, visuals and player controls below ("15 Nov 2026: the final seven breathing exercises"). Coherent Breathing (5-5) is now Simple Breathing; Pursed Lip is out 4 s; Bhramari is in 4, hum 7; 4-7-8 drops "4 rounds". |
| 5 Nov 2026 | The plan name defaults to "<Patient's name>'s Mind plan". |
| 5 Nov 2026 | The start date defaults to today and the end date to 3 weeks later. Length chips added: 1 week, 2 weeks, 3 weeks, 1 month, 3 months. |
| 5 Nov 2026 | Sleep defaults confirmed: 7.5 hours, bedtime 10:30 PM, wake time 6:00 AM. |
| 5 Nov 2026 | Coach's practices trimmed to the team's 21 in 8 categories. Removed Sleep Tracker, Sleep Tips, Sleep Breathing, Zen Flow, Star and Box Breathing. |
| 5 Nov 2026 | Mood check-in: one by default, Evening 9:00 PM. Adding another brings Morning 7:00 AM. |
| 5 Nov 2026 | Mood check-in: two by default, Morning 7:00 AM and Evening 9:00 PM, named by the part of the day. |
| 5 Nov 2026 | Me-time suggestions replaced with the team's 16 activities and usual times; picking one sets its time. |
| 5 Nov 2026 | Breathing: the team's seven exercises with starting minutes and usual times; minutes any whole number from 1 to 30; the exercise name is a dropdown to change it; every exercise can be removed, including the last. |
| 5 Nov 2026 | Default plan length is 15 days. The 2 weeks chip is replaced by 15 days: 1 week, 15 days, 3 weeks, 1 month, 3 months. |
| 5 Nov 2026 | A line under any text field when it reaches its character limit. Wind-down tasks go up from 80 to 100 characters. |
| 5 Nov 2026 | Wind-down suggestions replaced with the team's 11 tasks and usual times. Format: one text line (length in brackets when it has one) and one time; a range uses its first time. |

## 15 Nov 2026: the final seven breathing exercises

Signed off by design. These seven, no more and no fewer, are what a coach can pick and what the patient's player shows. The spec for each picture is `v7/mind/breath-lab/FINAL.md`; the live reference is `/v7/mind/breath-lab/final.html`.

| Key | Name the patient and coach see | Pattern | Visual | Assets |
|---|---|---|---|---|
| `coherent` | Simple Breathing (coach note: Coherent, 5-5) | In 5, out 5 | Breath clock ring in two equal halves, gold bloom in the centre | none, drawn |
| `sleep` | 4-7-8 Breathing | In 4, hold 7, out 8 | Breath clock ring, the hold dotted, bloom stays open through the hold | none, drawn |
| `box` | Box Breathing (4-4-4-4) | In 4, hold 4, out 4, hold 4 | A square track, one side per step, holds dotted, bloom | none, drawn |
| `exhale` | Extended Exhale (2:1) | In 4, out 8 | Breath clock ring, the out arc twice the in arc, bloom | none, drawn |
| `belly` | Belly Breathing | In 4, out 6 | Filmed side profile looping inside the ring | `mind/breath-lab/video/belly2/breath-loop.mp4` |
| `hum` | Humming Bee Breath (Bhramari) | In 4, hum 7 | Illustration, hands over the face (Shanmukhi), one still hum frame, inside the ring | `mind/breath-lab/frames/ai/hs-base.png`, `mask-face.png`, `si-0.png`, `si-2.png`, `si-4.png`, `sh-2.png` (and the `-al` copies) |
| `pursed` | Pursed Lip Breathing | In 2, out 4 | Close-up with a gold arrow in at the nose, out from the lips, inside the ring | `mind/breath-lab/frames/pursed/in.png`, `out.png` |

**Player controls** (the same on the lab's final page and the patient's player): a sound on or off button is always there; one Pause button (pause icon and "Pause"). Paused, it turns into Resume (play icon) and End appears beside it. The patient's player keeps its own shell around this: Start on the ready screen, the session time top right, Ended early (Keep Breathing, Save N Min or End Here) and Done (Do It Again, Back to Mind).

**Older names** saved in a plan still open the right exercise and are shown with today's name: Coherent Breathing (5-5) and Coherent Breathing to Simple Breathing, Sleep Breathing to 4-7-8 Breathing, Box Breathing to Box Breathing (4-4-4-4), Extended Exhale to Extended Exhale (2:1), Humming Bee Breath and Bhramari to Humming Bee Breath (Bhramari). Zen Flow Breathing, or any name not in the list, opens as Simple Breathing.

**Removed from the player:** Zen Flow, Star and 5 Finger Breathing, the shorter-count switch for holds (the ring is drawn from the real timings), and the 15 s rest between 4-7-8 rounds.

**Files:** names and timings `mind/breath-lab/lab.js` (`LAB.PAT`); the shared list `mind/breath-lab/final-list.js` (`LAB.FINAL`); the visuals `mind/breath-lab/final.js` and `ai-frames.js`; the coach's list `coach-mind/data.js` (`MP.BREATHS`, `MP.BREATH_ALIAS`); the patient player `mind/variants/breath.js`.

## 16 Nov 2026: mood check-in window and reply

- **Window.** A mood check-in can be logged from 3 hours before the coach's time until midnight that day (for 9:00 PM: 6:00 PM to 11:59 PM). Before it, the row reads "Opens at 6:00 PM" and a tap shows that in a toast. A late check-in still counts in full.
- **Two check-ins in a day.** If their windows overlap, the later one opens at the midpoint between the two coach times (12:00 PM and 3:00 PM: the 3:00 PM one opens at 1:30 PM).
- **Past days.** Closed: an unlogged check-in reads "Missed". (Before this, a past day could be filled in later.)
- **The sheet.** Title "How are you feeling?" and the five faces only (no slot line or hint). The reply sits in a quote card with the commentary's quote mark, not KAIRA's mark or name, in a supportive voice; the one button is always "Done".
- Code: v7/mind/variants/mood.js (openM, shut, rowD, MDVAR.open.mood). Cases: v7/mind-rhythm.html, mood rows.
- **Update, same day.** Before its window, the row keeps its usual line ("How are you feeling? Takes a few seconds"); tapping opens a sheet "Check in from 6:00 PM" ("You can check in your evening mood from 6:00 PM. It opens 3 hours before your coach's time, 9:00 PM, and stays open until midnight.", one Okay button), never a toast. A past day's unlogged check-in reads "Not logged" and opens "This check-in has closed".
- **Sample plan.** The coach portal's sample (MP.SAMPLE, which the patient Mind screen shows) now has two mood check-ins, 8:00 AM and 9:00 PM.
- **Breathing exercises section** (all seven, any time) shows only to free users and people waiting for a Mind plan; plan users breathe from their plan. Free users have no Rhythm score at all.
- **Lock sheet wording (16 Nov).** The message sits in the same quote card as the reply: "Your coach has suggested logging your evening mood after 6:00 PM, so please come back and log it then." The closed (past day) message uses the quote card too.
- **Row line (16 Nov).** Every mood check-in not yet logged reads "How are you feeling today?", whether open, not yet open, late or on a past day. A logged one shows the face and time.
- **Logged row line (16 Nov).** No time and no emoji once logged. Default "Feeling good" (the face word in lower case); options under review via ?mlog=1..5.
- **Logged check-in (16 Nov).** Tapping a logged check-in (row or tick) opens Eat's item menu, titled "Morning check-in" or "Evening check-in": "Change your mood" (opens the faces with the logged one picked) and "Remove this check-in" (red, no confirm; toast "Mood check-in removed"; the row returns to "How are you feeling today?"). If the window has closed, a removed check-in cannot be added back.

## 16 Nov 2026: plan rows, the breathing tick and the player's stop sheet

The designer went through the patient Mind plan rows one by one. This replaces "Ended early (Keep Breathing, Save N Min or End Here)" in the player controls above and the "Mark as done?" sheet on the breathing tick.

- **Mood check-in row.** No chevron. Everything else stays: title "Mood check-in", line "How are you feeling today?", the time on the right, the window and lock sheets, and the edit or remove menu once logged.
- **Wind-down and me-time rows.** Ticking stays one tap. Tapping a ticked row (body or tick) opens Eat's item menu (the sheet a logged food's tick opens), titled with the task name, with one row "Mark as not done" (Eat's undo icon). It unticks at once, no confirm, toast "Marked as not done". Wind-down rows show the task and its suggested time, no subtext; me-time shows "Time for yourself" and its time.
- **Breathing row, not done: the tick.** Opens a sheet titled with the exercise name (for example "Simple Breathing"), one line "In 5, out 5 · 5 min, suggested by your coach" (the pattern, the coach's minutes), a primary "Start breathing" (opens the player's ready screen) and a secondary outlined "I've already done it" (ticks the row, toast "Marked as done"). Tapping the row body still opens the player.
- **Breathing row, done.** The row body or the tick opens Eat's item menu titled with the exercise name: "Breathe again" (play icon, opens the player on a fresh ready screen at the coach's length) and "Mark as not done" (undo icon, unticks at once, clears the saved minutes, toast "Marked as not done").
- **Player ready screen.** The sound on or off button is there from the start, left of Start, the same button and place as while breathing (sound button, then one primary).
- **Session length.** A last option "No time limit" ("As long as you like"), a radio like the others. Picked, the button reads "Use no time limit"; the header pill reads "No limit" and, once started, counts up from 0:00 until they end it. Nothing ends on its own. The minute buttons now read "Use 5 min" (was "Use 5 Min").
- **Counting.** Once a session reaches 1 minute breathed, the breathing row is ticked right then in the background and Rhythm moves, even if they keep going or leave. Saved minutes are the whole minutes breathed (2 min 50 s saves 2 min), no longer capped at the coach's minutes. A finished timed session saves its whole minutes and ticks the row too.
- **Stop sheet.** X or End, once a session has begun (running or paused), pauses and asks:
  - 1 minute or more: title "N min saved", body "Your N minute(s) count and {exercise} is ticked in your plan." Primary "Save and exit" (saves the whole minutes, closes the player, no toast), secondary "Keep breathing".
  - Under 1 minute: title "Stop breathing?", body "Breathe for at least 1 minute for it to count." Primary "Keep breathing", secondary "Leave" (closes, nothing counts, the session is dropped).
  - Closing the sheet with its X goes back to where they were (running resumes, paused stays paused).
  - The "Ended early" screen and its "tap End, then Save" step are gone.
- For dev: a row ticked from the player is the same tick as a manual one; send the session's whole minutes when they save and exit (or when a timed session finishes), and the tick at the 1 minute mark.
- Code: v7/mind/layouts.js (row), v7/mind/plan.js (MD.menu, the wind-down and me-time untick), v7/mind/variants/breath.js (tick sheet, done menu, full-screen player). Cases: v7/mind-rhythm.html, the Mood, Breathing and Wind-down and Me-time sections (new: ?bfstate=lenfree, free, tick, askshort; ?untick=wd:0|me:0|br:0; ?done=br:0&sheet=brask).

## 16 Nov 2026: patient Mind screen, FlipCoins off, Practices for free users, the date sheet, and KAIRA behind the Rhythm line

Patient screen changes (`/v7/mind/index.html`), not coach portal creation, logged here so dev has them in one place.

- **FlipCoins are off on Mind** until the PM decides whether they exist: no Earn chip in the header, no coin toast after a log, no Earn FlipCoins sheet, no "+N FlipCoins" anywhere. One switch: `MD_COINS` in `mind/index.html` (false by default; `?coins=1` turns it on in the prototype). In the app, keep the coin code behind one flag the same way.
- **Practices tab: hidden from free users.** No Practices button in the bottom bar (Back, Mind, Trend, Learn) and no way in, deep links included. People waiting for a plan and plan users keep it.
- **Select date sheet, in Rhythm's terms.**
  - Plan users: each day's ring is that day's Rhythm out of 100, in Rhythm's gold (`#CDA935`, the gauge's 700; a full day has a `#F9DD80` centre dot); a day at 80% or more shows the medal; a day with nothing logged is a dashed ring. Key under the month: "The ring is your Rhythm out of 100. A medal is a day at 80% or more. A dashed ring is a day with nothing logged."
  - Waiting for a plan: no score, so no rings and no medal. A dot is a night with sleep logged; today with nothing yet is a hollow dot. Key: "A dot is a night with sleep logged. Your Rhythm rings start once your coach sets your plan."
  - Free users: no score, so no rings and no medal; they can still move between days to see their sleep. Same dots. Key: "A dot is a night with sleep logged. Pick a day to see it."
  - Picking a day keeps a free user or someone waiting for a plan in their own state (it used to switch them to a scored day). Screen reader labels say "sleep logged" or "nothing logged", no longer Move's "movement logged".
  - Bug fixed: the sheet did not open at all for free users and people waiting for a plan (it read Move's workout list).
  - Still Move's: the medal picture is Move's sneaker until the Mind medal is picked.
- **The line under the Rhythm score after a log.** One fixed sentence per kind of log; only the % changes, shown in the green capsule as on Move:
  - Sleep: "Last night’s sleep added +N%. A steady night is the base of your Rhythm."
  - Wind-down: "Your wind-down added +N%. Small steps in the evening help you sleep steady."
  - Breathing: "Your breathing added +N%. A few slow breaths help your body settle."
  - Me-time: "Your me-time added +N%. Time for yourself keeps stress low."
  - Mood: "Your mood check-in added +N%. Naming how you feel helps you understand your day."
  - Crossing 80%: "You’ve earned today’s medal! Your Rhythm went up by +N%. Well done." Reaching 100%: "You reached 100% Rhythm! You looked after your night and your day."
  - Every gain line ends in "Learn more". The nudges before a gain ("Log last night’s sleep to start today’s Rhythm.", "Keep going through your day to grow your Rhythm.") have none, as on Move. Rhythm never shows a minus.
- **KAIRA analysis.** Tapping Learn more, or anywhere on the card, opens Move's KAIRA analysis sheet (title "KAIRA analysis", circle X, "Got it"). It shows the shimmer and "KAIRA is looking at your day…" until the reply lands, then the note. The note is markdown: a bold opening, one sentence on why the score moved, "What helps next" with one or two points (action, time, +N%), under 60 words. Until the AI is live the prototype writes a sample from the same facts.
  - Code: `mind/rhythm-say.js` (`MDSAY.line`, `MDKAIRA.PROMPT`, `MDKAIRA.context`, `MDKAIRA.sample`), the sheet `move/kaira-sheet.js`. Cases: `v7/mind-rhythm.html`, The line under the score.
  - Send one request per tap: system prompt below, user message the context JSON. Snapshot the context when the score moves, so the note explains that change even if more is logged before the tap.

### The system prompt

```
You are KAIRA, the voice behind “Learn more” under GoodFlip’s Rhythm score on the Mind screen. Rhythm shows how well someone looked after their night and their day, against the plan their Mind coach set. They just saw the score go up after logging something, and tapped the card. Tell them, like a warm friend who happens to be a good coach, why it moved and what to do next.

WHO YOU ARE TALKING TO
People in India working on their metabolic health with a coach. Many are busy, some are older or unwell, many are new to apps. Plain, warm British or Indian English.

HOW RHYTHM WORKS (for you to understand; never explain the maths)
Out of 100, fresh each morning. Sleep counts most: hours against the coach’s target, and bedtime and wake time against the coach’s window. Then wind-down tasks, breathing, me-time (any one task is enough) and mood check-ins (checking in counts, the answer never does). Logging never lowers the score. 80% earns the day’s medal.

WHAT THE APP SENDS YOU
One JSON object: user_state, time_now, just_logged, score_before, score_now, change, medal, last_night (slept_hours, target_hours, bedtime, plan_bedtime, wake, plan_wake, window), sleep_parts, coach_targets, plan_items (kind, name, time, done, adds) and next_best (action, time, adds, score_after, best first).
Every number is final. Never calculate, round or invent a number. Use only numbers you were given. just_logged is the only reason for the change.

WHAT TO WRITE
Markdown, under 60 words in all:
**A short bold opening of 2 to 5 words**

One sentence on why the score moved, naming what they logged and the change as +N%.

**What helps next**
- One or two points, taken from next_best in that order: the action, its time, and what it adds as +N%.
If score_now is 100, skip What helps next and end with one line about resting well. If medal is “just earned”, open with pride in the medal. If next_best is empty, give one point about tonight’s bedtime from coach_targets.

VOICE
Second person, warm, specific, never guilty. At most one exclamation mark. Never recap their day or list what they already did; every line must tell them something. No medical claims, no diagnosis, no promises about sugar, weight or illness; “helps you settle” and “helps you get ready for sleep” are fine. Never comment on what mood they picked, only that they checked in. If last_night was short or late, be kind and point to tonight.
Never use these words: points, weights, algorithm, percentage of full, parts. Say “KAIRA” in capitals if you name yourself. No em dashes; use a comma or a full stop. Use the curly apostrophe ’.
```

### The context JSON, per request

Built by `MDKAIRA.context()` from the live plan and score. Every number is final; the AI never calculates.

| Field | What it is |
|---|---|
| `user_state` | `plan` (only plan users have a score and so this sheet; `free` and `waiting_for_plan` are listed for completeness) |
| `time_now` | The person's local time, "9:30 PM" |
| `just_logged` | `kind` (Last night’s sleep, Wind-down task, Breathing, Me-time, Mood check-in) and `name` (the task or exercise as the coach set it) |
| `score_before`, `score_now`, `change` | Whole numbers, the change always positive |
| `medal` | `just earned`, `earned earlier today` or `not yet` (80%) |
| `last_night` | `logged`, `slept_hours`, `target_hours`, `bedtime`, `plan_bedtime`, `wake`, `plan_wake`, `window` ("on time" or "40 min late"/"early") |
| `sleep_parts` | How full the hours and the window parts are, as "94% of full" (for the AI's reasoning only; never shown) |
| `coach_targets` | `sleep_hours`, `bedtime`, `wake`, `wind_down_tasks` (count), `breathing` (count), `me_time` ("any one" or "none"), `mood_checkins` (count) |
| `plan_items` | Every item in today's plan except sleep: `kind`, `name`, `time`, `done`, `adds` (what it would add if done now, 0 when done) |
| `next_best` | Up to two, best first: an unlogged night first, then the soonest open items from now, then ones missed earlier. `action`, `time`, `adds`, `score_after` |

Example (a wind-down task at 9:30 PM that crossed the medal):

```json
{
  "user_state": "plan",
  "time_now": "9:30 PM",
  "just_logged": { "kind": "Wind-down task", "name": "Screen-free wind-down begins (60 min)" },
  "score_before": 78, "score_now": 86, "change": 8,
  "medal": "just earned",
  "last_night": { "logged": true, "slept_hours": 7.3, "target_hours": 7.5, "bedtime": "10:50 PM", "plan_bedtime": "10:30 PM", "wake": "6:10 AM", "plan_wake": "6:00 AM", "window": "on time" },
  "sleep_parts": { "hours": "94% of full", "window": "100% of full" },
  "coach_targets": { "sleep_hours": 7.5, "bedtime": "10:30 PM", "wake": "6:00 AM", "wind_down_tasks": 3, "breathing": 1, "me_time": "any one", "mood_checkins": 2 },
  "plan_items": [
    { "kind": "Wind-down task", "name": "Last caffeine (tea, coffee or cola)", "time": "4:00 PM", "done": true, "adds": 0 },
    { "kind": "Wind-down task", "name": "Screen-free wind-down begins (60 min)", "time": "9:30 PM", "done": true, "adds": 0 },
    { "kind": "Wind-down task", "name": "Positive sleep association: prepare the room, dark and at a comfortable temperature", "time": "10:00 PM", "done": false, "adds": 8 },
    { "kind": "Breathing", "name": "Simple Breathing, 5 min", "time": "7:00 AM", "done": true, "adds": 0 },
    { "kind": "Me-time", "name": "Walk in nature or a park (20 to 30 min)", "time": "7:00 AM", "done": true, "adds": 0 },
    { "kind": "Mood check-in", "name": "Morning mood check-in", "time": "8:00 AM", "done": true, "adds": 0 },
    { "kind": "Mood check-in", "name": "Evening mood check-in", "time": "9:00 PM", "done": false, "adds": 5 }
  ],
  "next_best": [
    { "action": "Evening mood check-in", "time": "9:00 PM", "adds": 5, "score_after": 91 },
    { "action": "Positive sleep association: prepare the room, dark and at a comfortable temperature", "time": "10:00 PM", "adds": 8, "score_after": 94 }
  ]
}
```

What the sample note reads for it:

```
**Today’s medal is yours!**

You ticked “Screen-free wind-down begins (60 min)”, a small step that helps your body get ready for sleep, so it added +8%.

**What helps next**
- Your evening check-in at 9:00 PM, **+5%**
- Positive sleep association: prepare the room, dark and at a comfortable temperature at 10:00 PM, **+8%**
```

## 16 Nov 2026: which sleep the window judges

The designer asked whether a small afternoon nap, after a night on plan, takes the sleep window to zero. Before this, every sleep session that reached the score was added up as hours and the window read the first bedtime and the last wake-up of all of them, so a 2:00 PM nap made wake-up 8 hours late and halved the window (24 to 12). From now on only the night is judged. Coaches set nothing new; the plan's hours, bedtime and wake time, the 30 min allowance and the 2 h zero are unchanged.

Times below are minutes. `plan.bed` and `plan.wake` are the coach's bedtime and wake time on the same clock as the sessions.

1. **Today's sleep.** Every session whose end is after 6:00 PM yesterday and at or before 6:00 PM today. A nap that ends after 6:00 PM today belongs to tomorrow; one that ended before 6:00 PM yesterday belongs to yesterday.
2. **Tidy.** Sort by start. Merge sessions that overlap or touch (a watch and a phone sending the same night), so no minute counts twice. Then drop any piece under 10 minutes.
3. **Join into sleeps.** Walk the pieces in order. A piece joins the sleep before it when the break is 60 minutes or less, or when the break is 180 minutes or less and sits wholly inside the coach's window (`previous.wake >= plan.bed` and `next.bed <= plan.wake`). Otherwise it starts a new sleep.
4. **The night.** The sleep with the most minutes asleep (sum of its pieces; on a tie, the earlier one). Every other sleep is a nap.
5. **Hours points (23).** `asleep` = the night's minutes asleep, breaks left out, divided by 60. With target `T`:
   - `asleep < T`: `max(0, 1 − (T − asleep) / 3)`
   - `asleep > T + 1`: `max(0, 1 − (asleep − T − 1) × 0.20)`
   - otherwise `1`
   - points = `round(23 × that)`. Naps are not added (open decision: the prototype's `?naps=count` adds them).
6. **Window points (24).** If the night has under 180 minutes asleep, window = 0. Otherwise, for bedtime `d = |night.bed − plan.bed|` and for wake-up `d = |night.wake − plan.wake|`, each edge scores `1` if `d <= 30`, `0` if `d >= 120`, else `1 − (d − 30) / 90`. Window = average of the two; points = `round(24 × window)`. Early and late count alike.

**Examples, sample plan 7.5 h, 10:30 PM to 6:00 AM (hours / window, before then after):** night on plan plus a 20 min nap at 2:00 PM, 23/12 then 23/24. Slept 1 h late, 15/20 both. Awake 2 h at 1:30 AM inside the window, 8/24 both. A 2 h night, 0/12 then 0/0. Watch and phone sending the same night, 0/24 then 23/24. A night-shift sleeper (9:00 AM to 4:00 PM) on a night window, 19/0 both; with a coach-set day window, 19/24. The full table with links is in `v7/mind-rhythm.html`, "Sleep window: how it is judged".

**What the patient sees.** The sleep card adds one line per nap: "Also a 20 min nap at 2:00 PM. Naps don’t change your sleep points." A night under 3 hours adds "Under 3 hours of sleep, so your sleep window gets no points today." (A short sync from Apple Health or Health Connect keeps its gold "fix it" ribbon instead.) "How last night counts" lists hours, bedtime and wake-up with their points and each nap, for example "Slept 11:30 PM, 1h late: 8 of 12."

**Open for the designer.** Whether nap minutes count towards hours (recommended: no). Whether the 3 h minimum should ramp instead of cut (2h 59m gives 0 window points, 3h 00m can give 12).

- For dev: send every sleep session Apple Health or Health Connect returns for the period, with its start and end; do the tidy, join and night steps on the server so the app and the score agree. Hand-logged sleep follows the same rule.
- Code: `v7/mind/sleep-rule.js` (the rule, `MDSLEEP.split`, `score`, `words`), `v7/mind/rhythm.js` (`night()`), `v7/mind/variants/sleep.js` (card notes, "How last night counts", `?sleep=` cases). Self-check: `node app/public/v7/mind/sleep-rule.check.cjs`.
