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
| Coherent Breathing (5-5) | In 5 s, out 5 s, 6 breaths a minute | 5 (5 to 10) | 7:00 AM (morning) |
| Box Breathing (4-4-4-4) | In 4 s, hold 4 s, out 4 s, hold 4 s | 5 | 6:30 AM |
| Belly Breathing | Slow breath in as the belly rises, then a slow breath out | 5 | 7:00 AM (morning or noon) |
| Pursed Lip Breathing | In 2 s through the nose, out 4 to 6 s through pursed lips | 2 (2 to 5) | 12:00 PM (noon or when needed) |
| Extended Exhale (2:1) | In 4 s, out 8 s, no holds | 2 (2 to 5) | 12:00 PM (noon, night or when needed) |
| Humming Bee Breath (Bhramari) | In 3 to 4 s, hum on the breath out for 6 to 8 s | 5 (5 to 10) | 8:30 PM |
| 4-7-8 Breathing | In 4 s, hold 7 s, out 8 s, 4 rounds | 1 (1 to 2) | 9:30 PM |

Rules for turning the team's table into one value each: a range of minutes starts at its lower end, a range of times uses its first time, "Morning" is 7:00 AM and "Noon" is 12:00 PM.

- **Minutes:** any whole minute from **1 to 30**, from a dropdown.
- **Changing an exercise:** its name is a dropdown. Picking another exercise keeps the time and takes the new exercise's starting minutes.
- **Removing:** every exercise has a ×, including the only one. With none left, Next asks for one: "Add a breathing exercise."
- The same exercise can be added twice at different times.

**For dev:** these seven must exist in the patient app's breathing player. Today's reflection app has five (Sleep, Zen Flow, Star, 5 Finger, Box). Box and 4-7-8 (Sleep Breathing) match. The other five are new.

Data: `MP.BREATHS`, a list of `[name, how it goes, starting minutes, "HH:MM"]`; `MP.BREATH_MINS` is 1 to 30.

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
