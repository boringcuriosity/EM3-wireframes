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
| Bedtime | **10:30 PM** | Any quarter hour, at night or in the day. A night-shift sleeper gets a day window, for example 9:00 AM to 4:30 PM |
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
| Which sleep is judged | The window: the main sleep only (the longest sleep). Hours: the main sleep plus naps from the same 6 PM to 6 PM span (16 Nov 2026, see the entries at the end) |
| Shortest night for the window | 3 hours asleep, a hard cut. Under that, the window gives 0 |
| Sleep windows | One. The second window field (`rhythm.second`) is not used; a day window covers night shifts |

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
| 16 Nov 2026 | Naps count towards sleep hours (not the window); the 3 h minimum stays a hard cut; a coach can set the one sleep window in the day for night shifts, and the portal explains, draws and previews it ("16 Nov 2026: naps count towards hours, day windows"). |
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
| `hum` | Humming Bee Breath (Bhramari) | In 4, hum 7 | Illustration, fingers closing the ears, cut at the chest (no belly), one still picture per phase, inside the ring | `mind/breath-lab/frames/ai/hum-base.png`, `hh-2.png` |
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
   - points = `round(23 × that)`. Naps are not added. *Superseded the same day: naps are added, see the next entry.*
6. **Window points (24).** If the night has under 180 minutes asleep, window = 0. Otherwise, for bedtime `d = |night.bed − plan.bed|` and for wake-up `d = |night.wake − plan.wake|`, each edge scores `1` if `d <= 30`, `0` if `d >= 120`, else `1 − (d − 30) / 90`. Window = average of the two; points = `round(24 × window)`. Early and late count alike.

**Examples, sample plan 7.5 h, 10:30 PM to 6:00 AM (hours / window, before then after):** night on plan plus a 20 min nap at 2:00 PM, 23/12 then 23/24. Slept 1 h late, 15/20 both. Awake 2 h at 1:30 AM inside the window, 8/24 both. A 2 h night, 0/12 then 0/0. Watch and phone sending the same night, 0/24 then 23/24. A night-shift sleeper (9:00 AM to 4:00 PM) on a night window, 19/0 both; with a coach-set day window, 19/24. The full table with links is in `v7/mind-rhythm.html`, "Sleep window: how it is judged".

**What the patient sees.** The sleep card adds one line per nap: "Also a 20 min nap at 2:00 PM. Naps don’t change your sleep points." A night under 3 hours adds "Under 3 hours of sleep, so your sleep window gets no points today." (A short sync from Apple Health or Health Connect keeps its gold "fix it" ribbon instead.) "How last night counts" lists hours, bedtime and wake-up with their points and each nap, for example "Slept 11:30 PM, 1h late: 8 of 12."

**Open for the designer.** Whether nap minutes count towards hours (recommended: no). Whether the 3 h minimum should ramp instead of cut (2h 59m gives 0 window points, 3h 00m can give 12). *Both decided the same day, see the next entry.*

- For dev: send every sleep session Apple Health or Health Connect returns for the period, with its start and end; do the tidy, join and night steps on the server so the app and the score agree. Hand-logged sleep follows the same rule.
- Code: `v7/mind/sleep-rule.js` (the rule, `MDSLEEP.split`, `score`, `words`), `v7/mind/rhythm.js` (`night()`), `v7/mind/variants/sleep.js` (card notes, "How last night counts", `?sleep=` cases). Self-check: `node app/public/v7/mind/sleep-rule.check.cjs`.

## 16 Nov 2026: Mind medal

- A day at 80%+ Rhythm earns the Mind medal: **Lotus at dawn** (icons/badge/mind/lotus-glow.svg), the same frame as Eat and Move. Chosen on mind-medal-options.html. It hangs on the score, shows small in the date calendar and opens the celebration sheet (badge-celebration-options.html?only=1&pillar=mind): "Yay! You earned a medal. Congratulations, you received a medal for looking after your mind today. Your sleep, wind-down and calm moments all added up." No FlipCoins line in it (?coins=0 hides them on any pillar).

## 16 Nov 2026: naps count towards hours, day windows

The designer decided three things after the entry above.

1. **Naps count towards sleep hours.** In step 5, `asleep` is now the night's minutes asleep **plus every nap's** minutes asleep, all from the same span (sessions ending after 6:00 PM yesterday and at or before 6:00 PM today), divided by 60. The window (step 6) still reads the night only. Oversleep is unchanged: past target + 1 h, each extra hour loses 20%, so a long nap can cost hours points.
2. **The 3 h minimum stays a hard cut.** A night (main sleep) under 180 minutes asleep gives the window 0. No ramp.
3. **Night-shift sleepers: the coach sets a day window.** One sleep window, at any time of day. A coach sets, for example, Bedtime 9:00 AM; the wake time follows from the target (4:30 PM for 7.5 h). The window is judged exactly like a night window. To place the coach's window on the same clock as the sessions (minutes from 00:00 yesterday): wake-up = the wake time today (`wake + 1440`), or yesterday (`wake`) when today's would be after 6:00 PM; bedtime = wake-up minus the window's length. 10:30 PM to 6:00 AM is 1350 to 1800; 9:00 AM to 4:30 PM is 1980 to 2430. The second window field (`rhythm.second`) is not needed: one window, night or day, covers night shifts, and the score judges one main sleep. Its UI stays parked behind `?split=1`.

**Examples, sample plan 7.5 h, 10:30 PM to 6:00 AM (hours / window, now):** night on plan plus a 20 min nap at 2:00 PM, 23/24 (7h 50m, inside the 1 h allowance). Plus a 90 min nap at 1:00 PM instead, 21/24 (9 h, 30 min past the allowance). Woke at 4:30 AM and dozed 6:30 to 7:30 AM, 19/16 (was 12/16 with the night only). Only a 90 min nap, 0/0. Night shift 9:00 AM to 4:00 PM: on the night window 19/0; with the coach's 9:00 AM to 4:30 PM window, 19/24.

**What the patient sees.** The nap line on the sleep card: "Also a 20 min nap at 2:00 PM. It counts towards your hours, not your sleep window." "How last night counts": "Hours: 7h 50m asleep, your main sleep and a nap together, against your 7h 30m. 23 of 23." and "Your 20 min nap at 2:00 PM counts towards your hours, not your sleep window." When the hours go past the allowance, the hours line adds "More than 1h over your target takes some points off." The card's big number stays the night's own time asleep. With a day window, the card's bar runs 6 AM to 8 PM instead of 8 PM to 10 AM.

**What the coach sees (Sleep step).** Under Bedtime and Wake time: "Judged on the main sleep. Naps count towards hours, not the window." The card's line: "Drag the bar to set the window, at night or in the day for night shifts." A day window gets a midnight to midnight bar so it sits whole. "How the 47 points work": Hours, "The main sleep and naps together ... so a long nap can cost points"; Window, "The main sleep only ... Under 3 hours asleep earns none"; and "The day runs 6 PM to 6 PM. The longest sleep is the main sleep, the rest are naps." Review: "7.5 hours a day, naps included" and "Judged on the main sleep; naps count towards hours, not the window ... none if the main sleep is under 3 hours." The review's phone preview runs the patient screen with the coach's window, so its points match the patient's.

**Not supported.** A window whose wake time is after 6:00 PM (for example 2:00 PM to 10:00 PM): that sleep ends after the day closes, so it counts for the next day. Raise it if an evening-shift sleeper needs it.

- Code: `v7/mind/sleep-rule.js` (`score` adds naps; `opts.night` for the night-only draft, `?naps=night`; `place` puts the coach's window on the clock), `v7/mind/plan.js` (`bedM`, `wakeM` use `place`; the prototype clock moves past a day window's wake-up), `v7/mind/variants/sleep.js` (copy, the bar's span), `v7/coach-mind/rhythm.js` (copy, the bar for a day window), `v7/coach-mind/review.js`, `v7/coach-mind/data.js`. Self-check: `node app/public/v7/mind/sleep-rule.check.cjs`, all 34 cases pass.

- **16 Nov, later.** Removed the "How last night counts" sheet (?sheet=sleepinfo; nothing on the screen opened it) and the nap cards on the sleep card. Naps still count towards hours, quietly.

- **Breathing library player, X (16 Nov).** Once breathing has begun, X pauses and asks "End this session?" ("You have breathed for 1 min 20 sec. You can keep going or end it here."): Keep breathing (resumes) or End session. During the 3, 2, 1 or after Done, X closes straight away. Nothing is saved, as library sessions do not count for Rhythm.

- **Breathing library layout (16 Nov).** The section for free users and people waiting for a plan is now variant k3 (mind/variants/lib-k3.js, default ?vlib=k3 in mind/plan.js): seven full-width cards stacked vertically, each with its own scene (icons/mind/breath/<key>.webp), name, "pattern · minutes", and a footer with ▶ Start (left, green) and ⓘ Know more (right, quiet grey, opens how it works). No See all. Plan users still do not see the section.
- **Info sheet (16 Nov).** No "Good for" chips: Why it helps ends with it ("Good for calm and stress."). No line under Start.
- **Plan player title info (16 Nov).** The exercise name at the top of the plan player has an ⓘ; tapping it opens a sheet like the breathing library's (pattern, how it goes, the wave with its key, How it works, Why it helps with what it is good for) with one Got it. While breathing it pauses, and Got it carries on.
- **Humming Bee picture (17 Nov).** Confirmed with the coach: the simple pose, fingers gently closing the ears, replaces hands over the face (Shanmukhi). The picture is cut at the chest and fades to white, so the belly is not shown. Breathing in shows the plain pose; the hum shows the same pose with soft sound arcs by the ears. Files: `frames/ai/hum-base.png`, `hh-2.png` (`LAB.aiPlayer("humEar")`).

## 17 Nov 2026: Rhythm weights 25 / 25 / 20, and Sleep quality and Self-care as two parts

**Weights.** Sleep quality 70 = Sleep duration 25 (was hours 23) + Sleep consistency 25 (was sleep window 24) + Wind-down 20 (was 23). Self-care 30 = Breathing 10 + Me-time 10 + Mood check-in 10, unchanged. Changed in `mind/plan.js` (`P.w`), `coach-mind/data.js` (`MP.PARTS`, now named "Sleep duration" and "Sleep consistency"), `coach-mind/rhythm.js` (the "How the 50 points work" tips), `coach-mind/review.js` (wind-down reads the weight instead of a fixed 23), `mind/rhythm.js` header, `mind/sleep-rule.check.cjs` (all 34 cases re-worked and passing), `mind-rhythm.html` (tables and rules), the FTUX sample (`ftux/mind-kit.js`: 49, 59, 69) and `coach-mind/BRIEF.md`.

**Consistency in words.** 25 does not halve into whole points, so the patient no longer sees "12 of 12" per edge. `MDSLEEP.words` says the two edges in words and one total: "Slept 11:30 PM, 1h late. Woke up 6:00 AM, on time. Sleep consistency: 21 of 25."

**A part left out stays inside its group.** When the coach leaves out wind-down, breathing or me-time, its points now go to the other parts of the same group, so Sleep quality is always out of 70 and Self-care out of 30. No me-time: breathing 15, mood 15. No wind-down: Sleep duration 35, Sleep consistency 35. Before, every part scaled up together (a plan without me-time made sleep "of 78"). `MDRHYTHM.weights()` returns the weights for today's plan.

**Patient card options.** "What shaped your score?" as two tiles, Sleep quality of 70 and Self-care of 30, in five versions for where the explanation lives: `mind/variants/parts.js` (`?tiles=1&vparts=a..e`), compared in `mind/research/score-parts.html`. The Rhythm sheet's tiles show the same two parts.
- 17 Nov 2026: "What shaped your score?" option F (`?tiles=1&vparts=f`, the pick in `mind/research/score-parts.html`). Inside the card, above the Sleep quality and Self-care tiles, a header row "See how your Rhythm is shaped ›" (where Move shows Calories burned) opens one sheet with both parts; each tile opens its own. Every sheet now follows Eat's Nutrition breakdown: one bar per part, said as % of the Rhythm ("Sleep duration : 24%", "Out of 25%"), never "points"; then "For a good score" with one short line per part in the plan (sleep about the coach's hours, bed and wake near the window, wind-down, breathing, one thing you enjoy, mood); Got it is sticky.
- 17 Nov 2026: breathing sound, for now: singing bowl cues (one soft bowl as each part begins, higher to breathe in, lower to breathe out, a small chime on a hold, a low drone under the Bhramari hum) and Pixabay's "Breathing Calm" (The_Mountain, `mind/breath-lab/audio/breathing-calm.mp3`, looped) at 50% under them. Both players use it (`variants/breath.js` and the library's `LAB.phone`) through `SOUNDS.house` in `breath-lab/sounds.js`. Sound is still off until the person taps the sound button; the music plays only while breathing and stops on Pause, End, Done or closing. Other cue sets and tracks stay on `breath-lab/sounds.html` for coaches.
- 17 Nov 2026, later: option F's link moved from a header row to an indigo strip under the two tiles, "How your Rhythm is shaped ⓘ" (Move's rest-day strip, indigo instead of gold). In the sheet each part has one standing line above its bar: Sleep duration "How long you slept, against your coach's target. Naps count too."; Sleep consistency "How close your bedtime and wake-up were to your plan."; Wind-down "The evening steps your coach set to help you sleep."; Breathing "The breathing exercises in your plan."; Me-time "One thing you do for yourself today."; Mood check-in "Checking in on how you feel. Any answer counts." A divider separates Sleep quality from Self-care.
- 17 Nov 2026, final for now: the strip under the tiles is Move's rest-day strip exactly (gold glow from the middle, olive words, ⓘ), with no icon, reading "How your Rhythm is shaped". The sheet opens "Your daily Rhythm is made of 70% sleep quality and 30% self-care.", then each group with one line on why it matters (sleep: "Good sleep steadies your mood, focus and energy for the whole day."; self-care: "Small moments of care through the day keep stress low and your mind steady."), then each part: its bar, what it is, and "For a good score, ..." (sleep about the coach's hours, naps count; bed and wake near the plan; wind-down steps before bed; finish each breathing exercise; any one me-time task; check in each time, any answer counts). A divider between the groups; Got it is sticky.
- 17 Nov 2026: the two tiles lose their subtext ("Duration, consistency, wind-down", "Breathing, me-time, mood"). Three tile options under the gold strip, `?vparts=f&vtile=`: `m` Move's glass exactly (number, "of 70%" under it, the swell on the fill; default), `i` the number and "of 70%" on one line in a shorter tile, `s` a slim bar split into the group's parts (25 / 25 / 20, or 10 / 10 / 10) under the number with the glass left clear.
- 17 Nov 2026: picked tile option I (one line, "49% of 70%", shorter tile; now the default). The strip under the tiles turns indigo (the rest-day strip's size, type and centre glow, the glow fading to nothing at the side ends) and reads "Learn more about your Rhythm breakdown ⓘ".
- 17 Nov 2026: a refined particle figure for Pursed Lip, Humming Bee and Belly only, generated in Magnific (Nano Banana) at `mind/breath-lab/particles-ai.html` (frames in `breath-lab/frames/particles-ai/`, `-src` files are the full originals). Fine indigo dots with hairline lines, bald, gender-neutral. Pursed Lip: two aligned pictures (the out one is an in-place edit, only the lips change). Humming Bee: one picture, fingers closing the ears, cropped at the chest. Belly: a dotted tunic, the breath-in picture is the breath-out one with a small local swell under the hand (made in code so the two align exactly). No air drawn. Not in the final set; for review.
- 17 Nov 2026: option for the coaches, `mind/breath-lab/indigo-outfit.html`: Belly Breathing, Humming Bee and Pursed Lip with the same woman as the final set, her top lavender indigo and trousers slate indigo like the Mind scene illustrations, the Pursed Lip arrow and the hum's sound arcs in indigo; face, pose, crops, timings and the gold breath clock unchanged. One Magnific (Nano Banana) clothes-only edit per breathing set the colours, which were then laid onto every frame the final uses (`frames/indigo-outfit/`: `belly-loop.mp4` all 600 frames, `hum-in.png`, `hum-hum.png`, `pursed-in.png`, `pursed-out.png`) so pairs stay pixel-aligned. The final set is not changed.
- 17 Nov 2026, coach portal (`coach-mind-plan.html`):
  - **Review step:** "What Patient A will see" (the phone preview) and the "Coach's practices" card (with "Not scored", its empty state and the note) are gone; the review is one reading column. Practices and the patient note stay on step 3, where they are set. The read-only View shows only the bar, the dates line and the score card (no repeated name and dates).
  - **Scoring rules:** rows state the plan only ("10:00 PM bedtime to 6:00 AM wake"). Sleep duration, Sleep consistency and Mood carry a "How it is scored" disclosure (a `<details>`), one or two plain sentences, e.g. consistency: "Full points when bedtime and wake-up are each within 30 minutes of the plan. Fewer the further off, none at 2 hours. Naps never move it." One unit everywhere: "pts" (Sleep 70 pts, Sleep duration 25 pts, the step chips "20 pts"), replacing "25 of 100" beside "70 points". The Sleep step's nap line now reads "Naps add to the sleep hours but never change bedtime or wake-up."
  - **Assign to Patient A** asks first (bottom sheet on a phone, dialog on desktop): Assign to Patient A only (default); Update the template and assign (disabled with "This plan did not start from a template." for a blank plan); Save as a new template and assign, with a name field (prefilled "<template>, Patient A's version", must be filled and new). The button follows the choice: Assign to Patient A / Update and Assign / Save and Assign. The done screen says what happened to the template.
  - **Start screen:** "Start a blank plan" first, then "Or start from a template". Templates page five at a time on the start screen and in the library ("1–4 of 4" with previous and next).
  - **Phone:** the plans list starts at the top (the shell grid no longer stretches the header row); plan cards show dates only; the one-line summary bar is hidden in steps and View; Next buttons read "Next" (the stepper names the step); wind-down and me-time names wrap in full (one-row text areas that grow) instead of being cut off; the night bar is drawn at phone width with readable labels beside the handles; library cards drop the self-care counts; "None" for practices reads "No practices".
- 17 Nov 2026: Belly, Humming Bee and Pursed Lip now wear the Mind indigo everywhere (plan player, breathing library, final.html): the same woman and frames with her clothes in lavender and slate indigo, an indigo arrow and sound arcs, and a very soft indigo glow behind her. `final-list.js` points at `frames/indigo-outfit/`; the glow is `glow: true` on `LAB.clockBloom`.
- 17 Nov 2026: Create Mind Plan's template list shows only what helps choose: Template, Created by and Sleep window (About and Practices dropped; they show once the template is opened). Each master template names the coach who made it (sample: Dr. Meera Iyer, Rohan Kapoor, Ananya Desai; Coach A's own reads "You"); a template a coach saves records `by` (the coach's name) and reads "You" for that coach. On a phone each card reads "Name" then "By GoodFlip · 10:30 PM to 6:00 AM".
- 17 Nov 2026: all breathing exercises for plan users, five options on `mind/research/breath-rail-plan.html` (`?vlibp=a..e`, `mind/variants/lib-pl.js`; `lib.js` mounts it for plan users only when the parameter is set, free and no-plan users unchanged). One slim rail after the plan, "More breathing exercises", "Extra ones to try any time. Only your plan's breathing counts towards your Rhythm." Exercises not in the plan first, the plan's own last with "In your plan". Start on a plan exercise opens the plan's own player (counts towards the Rhythm); any other opens the library player (does not count). Know more opens the shared info sheet. Options: A slim scene cards (pick), B thumb cards, C small chips, D the rail inside one indigo card, E folded into one row.
- 17 Nov 2026: the "+x% Rhythm" moment when a mark lands, five options on the real screen (`mind/variants/win.js`, `?vwin=a..e`; doc `mind/research/rhythm-win.html`). A Rise (a glass pill rises from the tick: "+6% Rhythm · from your wind-down"), B To the top (a gold bead lifts to a capsule at the top), C In the row (a light wash along the row, the time makes way for "+6%"), D Shore (an indigo band above the tab bar), E Scaled (pick: Rise for ticks; last night's sleep or any gain of 15% or more gets Mind's full moment, lavender light from the tap, "Sleep logged", +49%, "added to your Rhythm"). For all: only gains show (untick or a full part shows nothing new, never a minus or +0%); quick ticks add up in one moment; mood reads "for checking in" and sits above its sheet; finishing wind-down reads "your wind-down is complete"; reaching 100% reads "Your Rhythm is full for today"; the moment replaces the toast it would collide with and the four-colour tick burst; reduced motion keeps a still fade. Hooks only: wraps `setHeroScore` and reads `MDPLAN.cause`.
- 17 Nov 2026: the coach's Rhythm overview, `v7/coach-mind-rhythm.html` (linked as "Rhythm" under Mind Plan in the coach portal's patient menu). Built like Momentum (`coach-momentum-day-parts.html`) and Nutrition Sufficiency: Daily, Weekly and Monthly with a date range; KPIs (average score with the same bands, nights logged, medal days at 80); "What stands out", up to 4 behaviour patterns first and the rest behind "Show more", each able to highlight its days on the chart (bedtime drift and recovery, weekend lie-ins, naps after short nights, nights on days off for a day window, mood falling or low moods after short nights, evening check-ins thinning, breathing sessions ending early, the wind-down step that slips and what it does to bedtime, me-time rarely done, no sleep data, nights too short to judge, steady wake-up); one chart with the night against the coach's shaded window (main sleep, time awake, naps, typed-in nights hatched, no data dashed, weekends shaded, coach notes) and the self-care rows under it (wind-down, breathing minutes, me-time, mood shown as the lowest face); "Behind the score" per part in pts with the behaviour behind it. Scored with the app's own `mind/sleep-rule.js` and the group-share weights. Today shows "so far" and stays out of the averages and patterns. Bedtime and wake-up averages use nights within 4 hours of the window, so a night-shift sleeper's nights off are counted apart. Three sample patients (`coach-mind-rhythm/data.js`, `?p=sahana|arjun|meera`). Mood answers are shown to the coach; they never move the score.
- 17 Nov 2026, later: Shaheer picked E for plan users, changed. The row after the plan reads "More breathing exercises" with "Additional exercises to try" (no count) and opens its own full screen, "All breathing exercises": a top bar with a back arrow and the title, no bottom nav, and the free users' K3 cards exactly (scene, name, pattern · minutes, Start left, Know more right, "In your plan" on the plan's own). Back (or Escape) returns to the Mind screen at the same scroll, focus on the row; the screen slides in 24 px and fades, and just appears with reduced motion. Start on a plan exercise opens the plan player and counts towards the Rhythm; others play in the library player and do not count. Still behind `?vlibp=e`.
- 17 Nov 2026: coach Rhythm overview: the "What stands out" cards are removed (Shaheer); the chart and Behind the score carry the story.
- 17 Nov 2026, later: Shaheer liked D (Shore). Four more in its family, with more emphasis and a soft layered gold glow in the score ring's gold (gauge 700 #CDA935, 600 #E7C144, 300 #FDE8A4), `?vwin=f..i` in `mind/variants/win.js`, after D in `mind/research/rhythm-win.html`: F Horizon (recommended: a wide gold horizon blooms behind a large "+6%" with "Rhythm" and the cause beside it, then settles to an ember), G Rim light (a frosted band with a thin gold rim drawn from the middle out, the gain large), H Ascent (a gold-haloed pill; as it goes its glow lifts off and drifts up toward the score, fading), I Halo (the pill in a layered gold halo, one slow shimmer across it). Same rules as A to E; a sheet that is up falls back to A's pill above it.
- 17 Nov 2026: coach Rhythm overview: coach notes removed (they don't exist in the product): no note dot on the chart, no Coach note legend chip, none in the day tooltip or side panel, and the sample note is gone from the data. The self-care icons in Behind the score now show (breathing wind lines, me-time the app's self-care heart, mood a smile); they were empty boxes because a double-quoted SVG URL broke its style attribute.
- 17 Nov 2026: coach Rhythm overview recoloured with GoodFlip colours by meaning (foundations/colors): sleep rows and Sleep quality parts in indigo steps (duration 600, consistency 500, wind-down 400), self-care in the tertiary accents (breathing teal-800, me-time flipgreen-600, mood check-in gold-700), low moods on the red status tint, the score ring and nights logged in indigo, medal days in reward gold.
- 17 Nov 2026: plan users now get breathing option E by default (no URL flag): after the plan, the slim row "More breathing exercises · Additional exercises to try ›" opens its own screen, "All breathing exercises" (back arrow, no bottom nav) with the free users' K3 cards; ?vlibp=a..d still shows the other rails. "In your plan" is now Trend's Coming soon chip (gold gradient pill, dark gold words) on the K3 cards and the rails.
- 17 Nov 2026, latest: Shaheer wants Eat's and Move's full-screen win for every Mind mark. Four options, first in `mind/research/rhythm-win.html`, `?vwin=j..m` in `mind/variants/win.js` (`fullScreen()`): J Lavender sweep (recommended: lavender light opens from the tapped tick and clears to white, a gold horizon under the gain), K Gold dawn (a soft gold dawn rises from the bottom into a pale morning), L Frosted veil (the screen frosts in a pale indigo veil, the lotus medal's glow breathing behind the number), M Ribbons (indigo and gold ribbons drift in and melt into one light, as Move's aurora). Every one: the pill names the mark in near-black ("Wind-down done", "Breathing done", "Me-time done", "Mood checked in", "Sleep logged") with a gold tick, the gain counts up large in dark gold, one line ("added to your Rhythm", "Your wind-down is complete", "Your Rhythm is full for today"); never the score. Tap anywhere closes it; it closes itself about 2.6 s after the words land; gains that arrive while it is open add up in it; unticks and 0 gains show nothing; a mood check-in shows once its sheet has closed; reduced motion is a still screen with a fade.
- 17 Nov 2026: coach Rhythm overview: the period-average "Behind the score" panel is removed; the chart runs full width. Tapping a day (or a week or month) opens the panel for that day only: its score, then each part with what was done, which wind-down tasks (✓ done, · not), breathing minutes and exercise, me-time, each mood check-in; Close hides it and the chart redraws at full width.
- 17 Nov 2026: coach Rhythm overview KPI row back to neutral like Sufficiency (grey score ring and meters), and no lotus icon on Medal days; the part colours in the chart and day panel stay.
- 17 Nov 2026: coach Rhythm overview: the Plan chip row is removed; the date picker opens with Plans (each plan's name, dates, length, Active on the current one; picking one shows only its days), then Last 7 / Last 14 days / All plans and From-To. Sample patients each have two plans (a starter 20 Oct to 2 Nov, then the current one from 3 Nov; ponytail: same targets), and the snapshot's Plan started is the active plan's start. The chart's self-care rows carry neutral icons like Sleep's moon. In a day's panel, wind-down tasks and me-time read as the coach wrote them, one per line, a green tick when done and an empty ring when not.
- 17 Nov 2026: coach Rhythm overview no longer says where sleep came from: no "From Apple Health / times edited by hand" in the tooltip, typed-in nights draw like any other (no hatch, no Typed in legend chip), no ring for edited times, and the help texts drop it. The snapshot's Sleep data stat (the patient's source) stays.
- 17 Nov 2026: coach Rhythm overview tooltip: wind-down reads only the count ("2 of 3 done"), me-time only Done or Not done; which tasks were done shows when the day is tapped.
- 17 Nov 2026: coach Rhythm overview: weekend shading removed from the daily chart, with its legend chip and help line; the S under the date marks the day.
- 17 Nov 2026: Mind Trend (coming soon) art balanced like Move's Momentum Trend: the "Your sleep" lines and "When you slept" rows turn indigo; the bars, the ring and the glow stay in the Rhythm's gold.
- 17 Nov 2026: Mind plan rows that open a sheet (breathing, mood check-in) carry their chevron right after the title; every row's time now sits alone at the right, so the times line up (mind/layouts.js row()).
- 17 Nov 2026: Mind plan rows that open a sheet (breathing, mood check-in) are one tap target: a tap anywhere on the row but the tick opens it. The breathing players' top bars (X, title, length) move below the phone's 54px status bar, which sat over them and clipped their tops: plan player .bf-top 44 to 54px (stage and words 10px lower), library player .lp-top padding 44 to 58px.
