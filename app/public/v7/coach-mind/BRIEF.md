# Brief: Mind plan in the coach portal (prototype)

Static HTML/JS, served by Vite at http://localhost:5173 (root `app/public`). Everything lives in `/v7/coach-mind/` plus the page `/v7/coach-mind-plan.html`. Plain JS (no frameworks, no build), IIFEs, each module its own file.

## Why
Today's coach portal (coach.mytatva.in, patient detail) has a Diet plan and an Exercise plan, and Success Coach (the psychologist, purple) has only Baseline and Follow-up Assessments: **no Mind plan**. Coaches assign Mind work today in a separate reflection app (27 templates, tick + "Times to fill"). We are designing the Mind plan inside the portal: the **scored Rhythm** (sleep and self-care, which makes the person's Mind score) plus the **coach's practices** (templates, not scored), assigned to one patient, from a template or from blank, step by step.

## Data (read `/v7/coach-mind/data.js` first, never duplicate it)
`MP.PARTS` (six scored parts, fixed weights: Sleep 70 = hours 23, window 24, wind-down 23; Self-care 30 = breathing 10, me-time 10, mood 10), `MP.WINDDOWN`, `MP.BREATHS`, `MP.BREATH_MINS`, `MP.BREATH_MAX`, `MP.METIME`, `MP.THEMES`, `MP.PRACTICES` (27), `MP.TEMPLATES` (4 samples), `MP.blankPlan()`, `MP.clone`, `MP.helpers`. The plan shape is `MP.blankPlan()`; a template has the same shape without patient or dates.

## The flow (host = coach-mind-plan.html + app.js)
1. Portal shell: patient side nav like the portal (Overview, Chat with Kaira, CARE TRIAD: Diet Coach, Exercise Coach, Success Coach with Baseline Assessment, Follow-up Assessments, **Mind Plan** new and selected). Top bar: page title, coach chip (Coach A, Psychologist).
2. **Mind Plans list** for the patient: filter pills All, Active, Drafts, Inactive; empty state first ("No Mind plan yet" + what it does + Create Mind Plan). Rows like the portal's diet plans (name, status pill, dates, View).
3. **Create Mind Plan** (full screen, like the plan builder): Start screen "Start from a template" (table of MP.TEMPLATES: name, about, sleep window, practices count, Use template) and "Start a blank plan". Also "Manage templates" opens the same steps in template mode.
4. Steps, with the stepper in the top bar showing a live subtitle per step:
   1. **Sleep** (70 points): plan name and dates card on top (plan mode only), then Hours of sleep, Sleep window, Wind-down tasks. Module `MP.steps.sleep`.
   2. **Self-care** (30 points): Breathing, Me-time, Mood check-in. Module `MP.steps.selfcare`.
   3. **Coach's practices** (not scored): pick templates, times to fill, habit tracker habits and weeks, a note for the patient. Module `MP.steps.practices`.
   4. **Review and assign**: what the patient will see, every choice summarised with Edit links back to its step, Assign. In template mode: Save template. Module `MP.steps.review`.
   Sticky bottom bar: left a one-line live summary, right Save as draft (plan mode) and the primary Next / Assign.

## Module contract (each step file)
```js
MP.steps.<key> = {
  title: "Sleep",                       // stepper label
  sub: function (plan) { return "70 points"; },   // stepper subtitle, live
  render: function (el, plan, ctx) {},  // draw into el; mutate plan in place; call MP.changed() after every change
  valid: function (plan) { return null || "message"; }   // blocking problem, shown by the host on Next
};
```
`ctx` = `{ mode: "plan"|"template", go: function (stepKey) {} }`. Re-render only your own el. Prefix every class with your module's prefix (`sl-`, `sc-`, `pr-`, `rv-`) and inject your CSS once from JS. Test your module alone with `/v7/coach-mind/harness.html?step=<key>` (it loads data.js, your file, and a starter plan from `?t=t-default`).

## Look (match /v7/coach-plan-builder-v4.html, the Diet plan builder)
- Page `#F9FAFB`; cards white, `1px solid #E4E7EC`, radius 18px, padding 20px 22px. Headings Montserrat 800 in `#1D4D38` (page 24px, card 16px); body Onest 400 14px `#475467`; small caps labels Onest 700 11px letter-spacing .08em `#475467`.
- Inputs: height 44px, bg `#F3FCF8`, border `1px solid #E4E7EC`, radius 11px, Onest 600 14px `#101828`. Steppers `− value +` with 36px square outlined buttons (`1px solid #299D6B`, radius 11px, green glyph).
- Primary button: `#299D6B`, white, Onest 600 13.5px, height 40px, radius 11px. Secondary: white, `1px solid #299D6B`, green text. Text links green.
- Mind accent: indigo for Sleep parts (`#444CE7` on `#EEF4FF`), teal for breathing (`#0E9384` on `#F0FDF9`), gold for me-time (`#B54708` on `#FFFAEB`), pink for mood (`#C11574` on `#FDF2FA`); practices use the Success Coach purple (`#7A5AF8` on `#F4F3FF`). Points chip: "23 of 100" small pill in the part's tint.
- Google Fonts: Montserrat 700/800, Onest 400/500/600/700.
- Usability: one primary action per screen; labels above fields; every number has its unit; group by the score's halves (Sleep 70, Self-care 30) and by theme; show system status (points always add to 100, counts live); undo for removals (a toast with Undo); prevent errors (limits disabled with a reason, e.g. breathing max 2); recognition over recall (suggested options as chips/lists, with "write your own"); consistent with the Diet builder. Keyboard and focus visible.

## Copy
British/Indian English, plain and warm, for a psychologist. No em dashes. No "X, not Y" or "no X, no Y" constructions. KAIRA in capitals. Title Case on buttons. Short.

## Rules
Do not edit data.js (tell me if it needs something). Do not commit. Verify in your own browser tab (close it after): no console errors, works at 1440x900 and 1280x800.
