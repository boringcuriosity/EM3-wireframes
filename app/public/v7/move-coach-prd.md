# Move, coach portal: the exercise plan and the patient's Momentum

Draft 1, 5 Nov 2026. For design, dev and product, and for an engineering agent to build from.

- **Companion:** the patient app is specified in `v7/move-prd.md` (the Move screen, Momentum, logging). This file covers only what the coach does in the portal, and how it reaches the patient.
- **Source of truth:** the prototype. Where this file and the prototype disagree, section 12 lists the known gaps; anything else, the prototype wins and this file is fixed.
- **Prototype:** `/v7/coach-exercise-template.html` (the plan list, the template picker and the builder) with `/v7/coach-exercise/start.js` (the list and the picker). `/v7/coach-momentum.html` and `/v7/coach-momentum-day-parts.html` (the patient's Momentum).
- **Prototype controls:** `?view=list` (default), `?view=pick`, `?step=2|3` (open the builder on Small moves or Steps goal), `?vsug=bar` (small move suggestions as one sheet). These are not product features.
- **Look:** the portal's newer look (patient-detail-v2), as List of Diet Plans and Create Diet Plan: Montserrat headings in deep green, Onest body, white cards on a pale page, the Flip green primary button.

---

## 0. Scope

| # | Area | Section |
|---|---|---|
| 1 | List of Exercise Plans, in the patient's record | 1 |
| 2 | Create Exercise Plan: start from a template, or blank | 2 |
| 3 | The builder, full screen: the frame, Save as Draft, leaving | 3 |
| 4 | Step 1, the exercise plan | 4 |
| 5 | Copying days, weeks and routines | 5 |
| 6 | Step 2, small moves | 6 |
| 7 | Step 3, the steps goal | 7 |
| 8 | Preview and Assign, with calories by day | 8 |
| 9 | How the plan reaches the patient | 9 |
| 10 | The patient's Momentum, for the coach | 10 |
| 11 | What the backend needs | 11 |
| 12 | Where the prototype differs | 12 |
| 13 | Open questions | 13 |

---

## 1. List of Exercise Plans

Under the patient, in the portal's patient record. Opens from **Care triad → Exercise Coach → List of Exercise Plans**.

### The patient's side panel

Sticky, with its own scroll, as on every patient-detail-v2 page:
- The patient: initials, name, "60 · Male", "Indication: Others", a chevron.
- Overview, Chat with Kaira.
- **PATIENT RECORD:** Shared Profile, Records, Lab Vitals, BCA Report (SOON), CGM Report (SOON), Consultations, Progress & Goals (Main Goals, Custom Goals, Assessment Recap), Other Trackers (Incentive Spirometer, Steps, Water Intake, Sleep).
- **CARE TRIAD:** Diet Coach, Exercise Coach (open: Baseline Assessment, Follow-up Assessments, **List of Exercise Plans**, selected), Success Coach.

### The page

- **Header** (pinned): **"List of Exercise Plans"**, a refresh button, **"+ Create Exercise Plan"**, and the coach (initials, name, "Exercise Coach").
- **Filter pills:** **All · Active · Drafts · Inactive**.
- **One row per plan:** a barbell icon, the plan's name, its status tag (**Active** green, **Draft** grey, **Inactive** red) and its dates ("5 Nov 2026 - 2 Dec 2026").
- **Actions on a row:**

| Plan | Actions |
|---|---|
| Active | **"View plan"**, **"Deactivate"**, copy |
| Draft | **"Continue editing"**, copy |
| Inactive | **"View plan"**, copy |

- **Copy** ("Copy into a new plan") opens the builder with that plan's contents and "{name} (copy)".
- **Empty filter:** "No {active | drafts | inactive plans}" / "Plans you create for this patient show here."
- A patient has at most one Active plan. Assigning a new one makes the old one Inactive.

---

## 2. Create Exercise Plan: start from a template

**"+ Create Exercise Plan"** opens a full screen page, as Create Diet Plan: a bar with **"Create Exercise Plan"** at the left and an **X** at the right (back to the list; Escape too).

- **Heading:** **"Start from a template"**. "Its routines fill each day of the plan, with small moves and steps set after. You can change anything before you assign it."
- **"Start a blank plan"** at the top right.
- **Search:** a field **"Search by template or coach"**, live as the coach types. Every word typed must be in the template's name or its creator's name. Beside it: "24 templates", or "N templates found" while searching. No match: **"No templates match "{q}"** Try a shorter word, or clear the search." The link clears it.
- **Table:**

| | Template | Length | Created by | Created on | |
|---|---|---|---|---|---|
| radio | name | "12 weeks" | the coach who made it | "23 Jun 2025" | **"Use template"** |

  Newest first. Clicking a row selects it (the radio fills, the row tints).
- **Pages:** 10 templates a page. "Showing 1–10 of 24", **Previous**, the page numbers, **Next**. A new search goes back to page 1.
- **Foot bar:** "Pick a template, or start a blank plan" (or "Selected: **{name}**, {n} weeks"), **"Cancel"** (back to the list), **"Next"** (on once a row is selected).
- **Use template** or **Next:** the builder opens on Step 1 with the template's weeks, routines and name filled in.
- **Start a blank plan:** the builder opens on Step 1 with one week, seven days, each with one empty routine, and no name.

---

## 3. The builder, full screen

### The frame

- **Full screen:** no portal rail, no menu, no breadcrumbs.
- **Top bar:** **"Create Exercise Plan"** at the left, the stepper in the middle, an **X** at the right.
- **Stepper:** **1 Exercise plan · 2 Small moves · 3 Steps goal**, each with a live line under it:

| Step | Line under it |
|---|---|
| Exercise plan | "4 weeks" |
| Small moves | "None yet" · "Set every day" · "N of M days" |
| Steps goal | "Not set" · "Off, user can’t walk" · "No steps days" · "10,000 a day" · "N of M days" |

  A step already reached can be clicked. Moving on from Step 1 runs its checks first.
- **Scale:** the editor is drawn at 85% of its old size, so a whole routine fits on a laptop screen.

### The foot bar

| Step | Left | Buttons |
|---|---|---|
| 1 | "Week 1 · Day 1 total 34 min · 172 kcal" (or "Day 7 is a rest day") | **"Save as Draft"**, **"Next: Small moves"** |
| 2 | "Small moves: {summary}" | **"Back"**, **"Save as Draft"**, **"Next: Steps goal"** |
| 3 | "Steps goal: {summary}" | **"Back"**, **"Save as Draft"**, **"Preview and Assign"** |

### Save as Draft

Saves the plan as it is, with no checks, as a **Draft** in the list under its name ("Untitled plan" with no name), and goes back to the list: **"Saved as a draft. Find it under Drafts when you are ready to finish."** **"Continue editing"** opens it where it was left.

### Leaving

The X asks first:

> **Leave this plan?**
> Your changes are not saved yet. Save it as a draft to finish later, or leave without saving.
> **Keep Editing** · **Leave Without Saving** · **Save as Draft** (the default)

Escape closes the question and keeps editing.

---

## 4. Step 1: the exercise plan

### Fields

| Field | Rules |
|---|---|
| Exercise Name | Up to 50 characters. Required: "*Plan name required". From a template: the template's name. |
| Indication | Read only, from the patient. |
| Start Date | Today or later, from the date picker only. Default today. |
| Select Disease | Diabetes, Fatty liver, PCOS, Thyroid, GLP, Obesity. Default Diabetes. Changing it resets the assessment. |
| Select Assessment | The patient's assessments for that disease. |

### Weeks and days

- **Weeks** in a column: **"Add week"** (up to **20**: "You can add maximum 20 weeks in a template"), each week removable (at least 1: "Minimum 1 week required"). A week that needs fixing shows a red count.
- **Days:** Day 1 to Day 7 as tabs. A rest day has a bed. A day that needs fixing has a red dot.
- **Day total**, at the right of the tabs: "Day 1 total **34 min · 172 kcal**", or "Rest day". A plain readout in grey and dark text, never green or in a pill, so it does not look clickable.

### Actions for the day

- **"Add a Routine"** opens **"Time of day"**: Morning, Afternoon, Evening, Night, each with its window ("6:00 AM – 12:00 PM").
  - **One routine per time of day.** A part that already has a routine is greyed and says "Has a routine". Choosing it anyway: "{Part} already has a routine. Add exercises to it instead."
  - Up to **10** routines a day ("Maximum 10 routines in a day").
  - A new routine arrives with its time set and one empty exercise row.
  - The menu ends with **"Edit times"**.
- **"Mark as Rest Day"** / **"Unmark as Rest Day"**. Marking keeps the routines underneath; unmarking adds an empty routine if there is none. On a rest day, adding or clearing says "Please unmark as rest day before proceeding."
- **"Clear all Values"** empties every exercise row.
- **"Copy this day"**, **"Copy this week"** (section 5).

### A routine

- **Header:** "Routine N", a delete button (at least one routine: "Minimum 1 Routine"), its **time of day** pill and **"Copy routine"**.
  - Pill: dashed gold **"Set time of day"** until set; the part's colour and window once set; red when missing after Next.
  - Choosing a part another routine has: "{Part} already has a routine. One routine per time of day."
- **Columns:** Exercise · Exercise Type · Reps · Set · Rest Post Set · Rest Post Exercise · Duration · Kcal burned (ⓘ) · Delete.
- **Exercise:** a dropdown with **"Search"** over the coach library of **202** exercises. The same exercise twice in a routine: "You cannot add the same exercise", and the row clears.
- **Type:** Breathing or Exercise, from the library.
- **Numbers:** digits only, up to 4. Empty shows a red border. The mouse wheel nudges them (1 to 9999).
- **Rests:** Sec or Min.
- **Duration** is worked out, not typed: `((reps × minutes per rep + rest post set) × sets) + rest post exercise`, shown in Min or Sec.
- **Kcal burned** per row: `round(MET × 3.5 × weight ÷ 200 × minutes)`. MET 1.5 for breathing, 4.5 for other exercises.
- Rows reorder by dragging the grip, or with the arrow keys ("Reorder X, i of n. Drag, or use the arrow keys").
- **"Add Exercise"** adds a row and opens its search. At least one row ("Minimum 1 Exercise").
- **Routine total** at the foot: "Routine 1 total **34 min · 172 kcal**".

**Kcal tooltip** (the ⓘ on the column):

> **How kcal burned is worked out**
> `kcal = MET × 3.5 × weight ÷ 200 × minutes`
> MET: How hard the exercise is compared with sitting still. 1.5 for breathing exercises, 4.5 for other exercises.
> 3.5 and 200: Fixed numbers that turn MET into calories per minute.
> Weight: The user's weight in kg.
> Minutes: The exercise's duration, from reps, sets and rest.
> Example: Lunges for 6 min: 4.5 × 3.5 × 65 ÷ 200 × 6 = **31 kcal**

### Parts of the day ("Edit times")

"These times apply to the whole plan: each routine's time of day and the small moves." **"Save times"**: "Times saved for the whole plan". A part needs a start and an end that differ ("Give {Part} a start and an end time that are not the same.").

| Part | Default |
|---|---|
| Morning | 6:00 AM to 12:00 PM |
| Afternoon | 12:00 PM to 4:00 PM |
| Evening | 4:00 PM to 8:00 PM |
| Night | 8:00 PM to 11:00 PM |

### Checks (Next and Preview)

| Problem | Message |
|---|---|
| No plan name | "Please enter the Plan Name", and "*Plan name required" under the field |
| A row with no exercise | "Please add the Exercise before proceeding." |
| Reps, sets or a rest empty or 0 | "Please add the {Reps / Sets / Rest Post Sets / Rest Post Exercise} for {exercise} before proceeding." and a banner "{Label} is required in week W and day D" |
| Duration 0 | "Exercise duration cannot be zero" |
| A routine with no time of day | "N days need a time of day for every routine. They are marked in red." The day shows "Day N needs fixing" · "Set a time of day for every routine." |

The page jumps to the first problem and highlights it. Rest days are not checked. **"Save & Next"** under a day moves to the next day, then the next week.

---

## 5. Copying

Three buttons, each with an info icon and an explainer on hover or focus:

| Button | Explainer |
|---|---|
| **Copy this day** | "Copies this day's {routines \| small moves \| steps goal} to other days. Pick the days on a grid, or use a quick pick like the rest of this week." + "On days that already have some, you choose to replace them or add to them." (not for steps) |
| **Copy this week** | "Copies every day of this week to the same days in the weeks you pick. Day 1 goes to Day 1, Day 2 to Day 2, and so on." + the same line (not for steps) |
| **Copy routine** | "Copies only this routine and its exercises to the days you pick, not the whole day. On days that already have routines, you choose to replace them or add to them." |

In Small moves and Steps goal, Copy this day is off until something is set ("Set something first").

### The copy sheet

Title: "Copy exercise plan" / "Copy small moves" / "Copy steps goal".
- **Copy:** "Day N", "Routine N only" (when the day has more than one), "{Part} only" (small moves), or "All of week W". A line under it says what goes: "Week 1, Day 1: 2 routines, 45 min", "Every day of week W goes to the same day in the weeks you pick." and so on.
- **To:** "Rest of week W", "Day N of every week", "Every day of the plan", "Clear all"; for a week, "All other weeks". Edited by hand it reads "Your own pick on the grid".
- **Grid:** a row per week, a column per day (D1 to D7); a row or column header picks the lot. Legend: "Copying from", "Copying to", "Already set".
- **On days already set** (not for steps): **"Replace what is there"** (default) or **"Add to it"**.
- Foot: "N days picked" (or "Pick days on the grid"), **"Cancel"**, **"Copy to N days"**. Toast: "Copied to N days".

Rules: replacing a whole day replaces its rest day status too; a working day copied onto a rest day makes it a working day. Small moves added are de-duplicated by title. A No Moves Day copies with a whole day, never with one part.

---

## 6. Step 2: small moves

- "Short bits of everyday movement, split across the parts of the day. The user ticks the ones you set here; they cannot add their own. Set a day, then copy it to as many days or weeks as you like." **"Edit times"**.
- Weeks and days as in Step 1, each day saying "N moves", "No small moves" or "Not set".
- Over the day: "Week W, Day D" and "N small moves" / "Nothing set yet", **"Mark as No Moves Day"**, **"Clear day"**, the copy buttons.
- **Four part cards** (icon, name, window, count). Each small move: a **headline** (up to 60, required: "Give each small move a headline, or remove it") and **a line on why it helps** (up to 140). A dashed full width **"Add small move"** box in every part. No limit per part.
- **No Moves Day:** "Day N has no small moves" · "Small moves won’t count in Momentum this day. Unmark it to plan moves." The moves stay underneath.

### Suggestions

A bulb on each part card opens that part's suggestions, each with **"+ Add"** (or "✓ Added"). Toast: "{title} added". Titles are actions; no times or tags are shown.

| Part | Suggestion | Line |
|---|---|---|
| Morning | Step into the sunlight and stretch | 10 min outdoor walk and a 5 min stretch |
| Morning | Take the stairs instead of the lift | 2 to 3 floors |
| Morning | Walk while you take calls | Walk during every call over 5 min |
| Morning | Walk to refill your water | Refill every hour at the farthest cooler |
| Afternoon | Take a calf raise break | 20 calf raises |
| Afternoon | Walk after lunch | 10 to 15 min |
| Afternoon | Climb a quick flight of stairs | Climb 2 floors up and down |
| Evening | Do wall push-ups | 15 against a wall |
| Evening | Do 30 squats | 30 bodyweight squats |
| Evening | Walk part of your commute | Get off one stop early, or park far |
| Night | Walk after dinner | 15 to 20 min |
| Night | Move at every ad break | March or stand at every ad break |
| Any part | Move while you wait | Calf raises while the lift, kettle or microwave runs |
| Any part | Go on a family walk | 30 to 45 min walk and stairs all day |

Source: "Momentum score, Asks" (the deck, `move/deck.html`), which also has a version of each for Mild, Moderate and Wheelchair, and marks the must-haves.

Variant `?vsug=bar`: one **"Select from suggestions"** button opens a sheet, "Week W, Day D. Ticked ones go into their part of the day.", grouped by part, with **"Add N small moves"**.

---

## 7. Step 3: the steps goal

- "The daily steps target. Every step the user walks counts toward it, wherever it comes from. Set a day, then copy it across the plan."
- **"User can’t walk"**, a switch for the whole plan: "For a permanent disability. Steps leave their Move screen for good, and their workouts and small moves make up the whole score." With it on: "No steps for this user" · "Turn the switch off to set a steps goal again."
- **Per day:** "Steps goal for this day", **−** and **+** by 500, a field ("Enter steps", shown as "10,000", up to 99,999), "steps a day · the buttons move it by 500". Going to 0 unsets it. No default; not required.
- **"Mark as No Steps Day"**: "Day N has no steps goal" · "Steps won’t count in Momentum this day. Unmark it to set a goal." For a short spell (a cast, an injury), copy it across the days it applies.
- Copying a steps goal has no replace or add choice.

---

## 8. Preview and Assign

**"Preview and Assign"** runs the checks (section 4), then opens a dialog: **"Preview and assign"**, "Are you sure you want to preview and assign this exercise plan?", **No** / **Yes**.

### Tab 1: Check and assign

- **Spread check:** a working day that moves in fewer than **2** parts of the day (a part counts when it has a routine with an exercise, or a small move):
  > **{n} days move in fewer than 2 parts of the day**
  > A part of the day counts when it has a routine or a small move. Momentum grows when movement is spread through the day, so these days will score lower on moving all day.

  The days, by week, each with its four parts as chips and "Only morning" / "Nothing planned". **"Assign anyway:** I have checked these days and want to keep them as they are." must be ticked before Yes works.
- **"Save as a template too:** Reuse this plan for other users." Ticked, a choice: **"Save as a copy:** A new template. The master stays as it is." (default, with its name, "{name} (copy)", up to 60) or **"Update master template:** Changes "{name}" for every coach."

### Tab 2: Calories by day

The whole plan's calories, to check the load before assigning.
- **Above:** two cards, **A day, on average** and **Highest day** (its kcal, then "Week W, Day D"). A legend: Workout, Steps, and "kcal a day · point at a day for its split".
- **Table:** a row per week, Day 1 to Day 7, and the week's total (tinted). It scrolls inside a fixed height for long plans (up to 20 weeks), with the day names and week names held in place.
- **Each day:** only its total kcal, and a thin bar split into **workout** (indigo, every routine that day) and **steps** (teal, the day's steps goal as kcal), scaled to the plan's biggest day.
- **Pointing at a day** gives its split: "Week 1, Day 1: workout 172 kcal, steps 239 kcal (10,000 steps)", or "rest day", "no steps", "steps not set".
- **A rest day:** its number in grey and "Rest day".
- With **User can't walk** on, there is no steps part.
- **Steps kcal:** steps × (height × 0.414) gives metres, then km × kg × 0.5. Uses the patient's weight and height (the prototype uses 70 kg and 165 cm). Small moves are not counted.

### After Yes

A preview page: "Preview and Assign Plan" with Exercise Name, Start Date, End Date (start + weeks × 7), Small moves, Steps goal, Master template ("Will be updated with these changes" / "Not changed"), Copy template ('Saved as "x"' / "Not saved"), and a phone showing the patient's first day. **"Assign"**: "Exercise plan updated successfully" (with "and master template" and ', copy saved as "x"' as they apply). **"Cancel"** asks first.

---

## 9. How the plan reaches the patient

| Coach setting | On the patient's Move screen (`v7/move-prd.md`) |
|---|---|
| Routines and their exercises | The part of the day cards, "Your coach's plan" |
| A routine's time of day | The card its exercises sit in |
| Parts of the day times | The windows on the cards and in the score |
| Exercise kcal | The Workout target ("N of 118 kcal") |
| Small moves | Each part's "Small moves" ticks, the Small moves target ("N of 5") |
| Steps goal | The Steps target ("N of 10,000 steps") |
| Rest Day | Workouts off that day; the score re-shares |
| No Moves Day | Small moves off that day |
| No Steps Day | Steps off that day |
| User can't walk | Steps gone for good: Workout 60, Small moves 20, Spread 20 |
| Start date and weeks | Which plan day the patient is on |

Momentum's weights: Workout 45, Steps 25, Small moves 15, moving through the day 15 (3.75 a part, up to 4). A part with no target sits out and the rest share the 100.

---

## 10. The patient's Momentum, for the coach

On the patient's Overview: `/v7/coach-momentum.html`.

- **Card:** "Momentum" · "How fully the movement plan was done, and how spread through the day, out of 100."
- **Range:** Last 7 days, Last 30 days, Last 8 weeks, Whole plan, or two dates ("Pick both dates.", "The start date is after the end date.", "Pick dates between {plan start} and {today}."). "Records start on {date}, when the plan began." **Daily · Weekly · Monthly**.
- **KPIs:** the average score with its band, "Days with movement X of Y", "Medal days X of Y".

| Band | Score |
|---|---|
| 🏅 Great | 80 and over |
| ✨ Solid | 70 to 79 |
| ⛅ Room to grow | 50 to 69 |
| ⚠️ Needs attention | under 50 |

- **Chart:** a stacked bar per day (or week, or month) in the score's parts: Workout 45, Spread 15, Steps 25, Small moves 15. A dotted "Medal 80" line and a dashed "Avg N" line. Empty days: "Nothing recorded". Pointing at a bar: each part as "x / max".
- **Their own workouts:** the top 3 workouts they logged beyond the plan, with the number of days, "+N more". None: "None logged beyond the plan".
- **Behind the score:** **Plan done**: workout kcal "Full on X of Y days", small moves "All done on…", steps "Goal met on…". **When they move**: each part of the day, the lowest one marked. A selected bar shows that day's gauge, "±N vs period average" and "← Whole period".
- **KAIRA:** a drawer for questions on this patient's data, with suggestions ("When in the day does Sahana move?", "Compare weekdays and weekends", "Show the score by week"). Foot: "KAIRA · Answers cite patient data and may need clinical review".

### Variant: when they moved, against the plan

`/v7/coach-momentum-day-parts.html`. Daily by default. A grid of Morning, Afternoon, Evening and Night by day:

| Cell | Meaning |
|---|---|
| Filled, by how much | Done, by the share of exercises and small moves |
| Dashed | Planned, not done |
| Light with an edge | Moved when nothing was planned |
| Grey | Nothing planned |
| Bed | Rest day, never counted as missed |

The score sits over each day, with a badge for their own workouts. Legend: "Done, by how much", "Planned, not done", "Moved, not planned", "Rest day", "Their own workout". "Rest days in the plan are not counted unless they moved."

---

## 11. What the backend needs

| Need | Notes |
|---|---|
| Plans per patient | Name, status (Active, Draft, Inactive), start date, weeks, disease, assessment, created by, created at |
| Templates | Name, weeks, created by, created at; the same plan shape; searchable by name and creator; paged |
| Plan contents | Per week and day: rest day; routines with time of day and exercises (exercise id, reps, sets, rest post set and unit, rest post exercise and unit, duration and unit); small moves per part (headline, line); No Moves Day; steps goal or No Steps Day |
| Plan settings | Parts of the day times; User can't walk |
| Drafts | Saved as they are, with no checks; reopen where left |
| Assign | Makes the plan Active, the old Active plan Inactive; optional template save as a copy or over the master |
| Deactivate, copy | From the list |
| Exercise library | The 202 coach exercises, with type and MET (`v7/move-exercise-lists.html`) |
| Patient's weight and height | For kcal in the builder and the calories by day tab |
| Momentum by day for a patient | Its parts, medal days, days with movement, their own workouts, each part of the day done |
| KAIRA | Questions answered from the patient's data |

---

## 12. Where the prototype differs

| Prototype | Spec |
|---|---|
| Plans and templates are samples; every template loads the 120 days Plan's routines, renamed | Each template's own plan |
| Only the first 4 of 12 weeks of the 120 days Plan load | The whole plan |
| Weight 65 kg in exercise kcal, 70 kg and 165 cm in steps kcal | The patient's own weight and height |
| A draft reopens with its name only | Reopens where it was left |
| The preview page's phone shows only Week 1, Day 1, Routine 1, with fixed routine tabs | The patient's real first day |
| A "Basic" copy variant sits hidden in the code | Smart copy only, as in section 5 |

---

## 13. Open questions

| # | Question | Notes |
|---|---|---|
| 1 | Copying with "Add to it", or copying one routine, can give a day two routines at the same time of day | Block it, merge them, or allow it? |
| 2 | The coach KAIRA says "each part of the day adds 10 points" | It is about 4 (15 ÷ 4). Fix the reply. |
| 3 | Small moves for each level of mobility | The deck has Mild, Moderate and Wheelchair versions; the builder offers only the "No limitation" ones. Show the patient's level's version? |
| 4 | Must-have small moves | Marked in the data; not shown to the coach. Show them, or pre-fill them? |
| 5 | Move Kit moves (grip trainer, breath trainer, bands, bottle curls, slant board) | In the deck; not in the suggestions. |
| 6 | A default steps goal | Today a day has none until the coach sets it. Start at 10,000? |
| 7 | Who can update a master template | Any coach, or only its creator? |
| 8 | The "Assign anyway" tick sits in the first tab only | Fine, or show it from both tabs? |
| 9 | Deactivating the active plan | Ask first? What does the patient see until a new plan is assigned? |

---

## Rules everywhere

- **Copy:** plain British or Indian English. KAIRA in capitals. No em dashes. No "X, not Y" or "no X, no Y". Title Case on buttons. Use the copy in this file exactly; change it here first.
- **Visual:** the portal's newer look. Readouts (totals, counts) are plain text, never green or in a pill, so nothing that cannot be clicked looks clickable.
- **Motion:** smooth eases, no bounce.
- **Accessibility:** every control reachable by keyboard; tabs, radios and dialogs carry their roles; Escape closes the top dialog.
