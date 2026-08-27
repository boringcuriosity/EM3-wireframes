# GoodFlip EM3 wireframes — handoff

Everything a person or an agent needs to pick this up cold.

---

## 1. What this is

A clickable wireframe of a redesign for **GoodFlip**, a live metabolic-health app for the
Indian market. Diabetes-led, coach-delivered, with **Kaira** as the AI companion.

It is not a production app. It is a full-fidelity prototype used to think with and to show
stakeholders. It has no backend, no router and no persistence: every screen is a function of
one state object, and every state is reachable from a control panel beside the phone.

**EM3** is the framework the whole product runs on: **Eat, Move, Mind, Measure.** Four
habits, repeated most days.

### The goals behind every decision

1. **Make the user ↔ coach relationship strong.** The program is people, not software. When
   something can come from a named coach rather than from the system, it should.
2. **Run the EM3 story through the whole app**, not just one screen.
3. **Build sustainable habits, not streak pressure.** Skipping is a real answer. A day you
   chose to make smaller should look smaller, not look failed.
4. **Everything must be reachable from the control panel.** A state nobody can demo does not
   exist.
5. **It must behave like a real app.** No dead ends, no lorem, no "coming soon".

---

## 2. Running it

```bash
cd app
npm install
npm run dev          # http://127.0.0.1:5180
```

Verification loop, all four before you call anything done:

```bash
npm run check        # static: every context key a component reads is actually provided
npm run smoke        # SSR-renders ~200 states and reports any that throw
npx oxlint src       # lint
npm run build        # production build
```

`npm run smoke` is the one that catches real breakage. It walks the control panel's own state
list, so if you add a state, add it to the panel and smoke covers it for free.

### The four URLs

| Path | What it is |
|---|---|
| `/` | the live wireframe, where all work happens |
| `/v1` | a **frozen snapshot** of the diary design: chronological To-do, one card on Home, the plan handover card, the two device syncs, the weekly read. Served from `app/public/v1/`. |
| `/v0` | a **frozen snapshot** of the older pillar-grouped To-do, from before the diary rewrite. Served from `app/public/v0/`. |
| `/scenarios` | working notes: every user moment in To-do, EM3 and the streak, written as open questions, with a suggestions tab. Static HTML in `app/public/scenarios/index.html`. |

**Never change a snapshot as a side effect of anything.** Refresh one only when explicitly
asked. Each carries a `README.txt` with its own recipe; they look like this:

```bash
rm -rf public/v1 dist-v1
npx vite build --base=/v1/ --outDir dist-v1
mkdir -p public/v1 && cp -R dist-v1/. public/v1/ && rm -rf dist-v1
rm -rf public/v1/v0 public/v1/scenarios
```

The first `rm` matters: `public/` is copied into every build, so a snapshot taken without it
contains a copy of the old one inside itself. The last line drops the other snapshots, which
the build copies in for the same reason.

In dev, `/v0/`, `/v1/` and `/scenarios/` need the explicit `index.html` (Vite's SPA fallback
answers the bare directory with the live app). On the deployed site the bare paths work.

### Deploying

```bash
cd app
npx vercel --prod --yes --scope boringshaheer-gmailcoms-projects
```

The `--scope` flag is required: `app/.vercel/project.json` records a team org id but the
project actually lives under the personal scope. Live at
**https://em3-wireframes.vercel.app**. Repo: `boringcuriosity/EM3-wireframes`, branch `main`.

**Do not push or deploy unless asked.** The user batches changes and says when.

---

## 3. How the code is put together

Vite 8 + React 19. No router, no CSS framework, no state library. Inline styles, tokens from
one file, icons from `lucide-react`.

```
app/src/
  state.jsx        one context provider, every toggle in the app, all derived truth
  App.jsx          which screen renders, the tab bar, the overlay stack
  tokens.js        the palette; nothing invents a colour
  ui.jsx           a few shared bits (sectionLabel, coachAvatar)
  index.css        fonts and every @keyframes
  screens/         one file per screen, plus screens/today/day.js
  components/      everything else
```

### The one rule that matters: derive, never duplicate

Every fact has exactly one source, computed in `state.jsx` and read everywhere else. Almost
every bug in this project's history was two places holding the same fact and disagreeing.

Examples that exist today:

- `dayRows` / `dayLive` — today's tasks, built once by `buildDay()`
- `dayPhases` — the same rows grouped into Morning / Afternoon / Evening
- `planAssigned` — `plan === "paid" && kcalSource === "coach" && !!movePlan`
- `heroState` — what the top of To-do shows, from the plan and the day
- `celebrated` — which rows have already played their finish animation
- `HOME_CARDS` / `HOME_TABS` — the Home carousel and its chips

If you find yourself writing the same number in two components, stop and derive it.

### The day model — `screens/today/day.js`

The whole To-do screen falls out of one array. Every row carries `at`, a minute of the day;
the phase is derived from that single number, so nothing has to be filed by hand.

```js
export const phaseOf = (at) => (at < 12*60 ? "morning" : at < 17*60 ? "afternoon" : "evening");
```

A row looks like:

```js
{ id, pillar, at, title, when, tip, kind, to, done, skipped, phase,
  opts, oi, items,        // meals only: the coach's options
  goal, now, add }        // targets only: water, steps
}
```

`kind` is `"tick"` (records itself), `"go"` (sends you to the screen that owns the record) or
`"target"` (counts up). `openRow()` in `state.jsx` is the single place that decides what a tap
does.

### The control panel — `components/ControlPanel.jsx`

The panel is the map of the product. `ALL_GROUPS` lists every group; `SCREEN_GROUPS` says
which groups are relevant to which screen, so the panel can filter itself to what you are
looking at. **Any new state must get a chip here**, both because the user demos from it and
because `npm run smoke` reads it.

---

## 4. The design language

Fonts: **Playfair Display** for display type, **Roboto** for everything else, both loaded in
`index.css`. They are the product's own faces; do not swap them.

Colours live in `tokens.js`. Green `#299D6B` is the brand and the primary action. The four
pillars each own a hue: Eat green, Move indigo `#444CE7`, Mind teal `#2DA6A6`, Measure gold
`#CDA935`. Gold also means Flipcoins and streaks. Amber `#DC6803` means "this needs
attention". Nothing outside `tokens.js` is allowed.

Animation keyframes all live in `index.css`: `strikeIn`, `taskPop`, `haloOut`, `checkDraw`,
`flashOut`, `confettiOut`, `popIn`, `riseIn`, `scrimIn`, `sheetUp`, `glowBreathe`,
`toastDown`, `kairaPulse`, `strikeWipe`, `spin`, `drawLine`, `shimmer`.

### Copy rules

- Plain, friendly, human. Write from the user's side of the screen.
- **No em dashes.** Use a comma, a full stop or a colon.
- **No AI jargon.**
- **Never write in negations or contrasts.** No "no overhaul, no rules to memorise", no
  "eating right, not eating less", no "this, not that". State the true thing positively. The
  user rejects this pattern on sight.
- Kaira is never a narrator. She does not recap the user's day back to them. Every line she
  says must carry something they did not already know.
- The calorie target is always the coach's by default. The user can edit it. There are no
  ownership variants.
- Follow the **Impeccable** principles skill for anything visual.

---

## 5. Where the product currently stands

### To-do is a chronological diary

The big change this cycle: To-do used to be four pillar sections. It is now **the day in the
order it happens**, grouped Morning / Afternoon / Evening, with the pillar riding along as the
colour of each row's circle plus a small pillar chip after the title, tied to the last word so
it follows the text when a title wraps. One phase is open at a
time: the earliest one still with something in it.

`/v0` still holds the old pillar-grouped version for comparison, and `/v1` freezes this diary
design as it stands.

### One card owns the day

Home's **Today's focus** is a single card: a slim streak line with a bar, the next two tasks,
"x more tasks left today", then a **Metabolism** section of four cards as the way into each
pillar. To-do carries the same streak bar under its heading. When the day is finished, both
show the same "We are proud of you" card.

Three other Home card shapes are still switchable from the panel (Up next, This part of day,
Next task) while the user decides.

Everything about today is said **once**. There used to be a flame, a total, a phase count and
four pillar fractions all describing the same day in different denominators.

### The first run

Home's Today's focus slot on day one is `FtuxExplainer.jsx`: the four pillars, one line about
the tasks built on them, and a button into `Em3Explainer.jsx`. That screen leads with a working
miniature of a day, three rows ticking themselves one after another, then the streak bar filling
and the Flipcoins line arriving once the list clears. The four pillars sit under it as separate
cards named Fuel, Burn, Calm and Know, the same four words the splash screen opens with. The
animation runs once and stays finished, because a loop that resets turns the screen into a
screensaver.

### The plan handover

`PlanCard.jsx` is one card in one slot with four states: no plans yet, diet in, exercise in,
both in. The two chips stay put and fill in as each plan lands, so nothing jumps. The cross
appears only once both are in, because until then the card is the only thing explaining why
half the day looks thin. Tapping the card opens `PlanChangedSheet`, which shows what the coach
actually set, with tabs when both landed together.

### The device syncs

`screens/measure/CgmSync.jsx` and `BcaSync.jsx` are full screens opened from their own Measure
rows. Both follow the same shape: fetch, show the reading, and mark the task done at the moment
the number lands, since nobody reads a glucose value and then also ticks a box. The toast merges
with the day's own, and the row is struck by the time they walk back to it.

### Trends

Eat has had a Trend tab for a while. Move and Mind now match it: `MoveTrend.jsx` and
`MindTrend.jsx`, sharing `components/TrendShell.jsx` for the week picker, Kaira's read, the
stat row and the waiting state. The charts are pillar-specific on purpose. Move asks how much
and how often, so it draws minutes against the target with gaps left visible. Mind asks when,
so under the hours it draws the hour each night started, where the wobble is the finding.

Each has four states in the panel: nothing yet, a couple of days in, a week to read, and a
settled stretch.

### The weekly read

A trend nobody finds is a trend nobody has, so the week comes to the day. Two shapes, both in
the panel under **Weekly insight**: three reads spread across the day (sleep in the morning,
movement in the afternoon, food after dinner), or one Measure row in the evening that opens
`WeekReadSheet` covering all three. Either way `openWeek()` in `state.jsx` is the single
opener, and it sets the pillar's trend to a week worth reading before navigating, because
sending somebody to a page that says "not enough days yet" is worse than not sending them.

Reading counts toward the day and the streak. That was a deliberate call: receiving an insight
is not the same as doing a task, but showing up to read your own week is still showing up. It
pays 5 Flipcoins rather than 10.

### Finishing things

- Tick a row on the diary: strike, circle pop, halo, confetti. The strike is a background rule
  cloned per line fragment, so a title that wraps gets a line per line rather than one bar
  across the box.
- Finish a task somewhere else, for instance logging a meal inside Eat: a toast appears where
  you are, in the pillar's colour, merged with the Flipcoins toast so there is only one.
- Finish the whole day: a full-screen moment, then a gold card that stays.

### Skipping

Three dots on any row open a sheet that asks a question and gives two buttons. A skipped row
fades, says "You skipped this today", and leaves the day's count entirely, so nothing reads as
missed. Tapping it reopens the sheet.

---

## 6. Open questions, not oversights

`/scenarios` is the full list. The ones that block other work:

1. **What is To-do for someone with no program?** It currently borrows the program's language
   (coaches, plans on the way, diagnostics to book) for a person who has none of that.
2. **Where does the program get offered?** The moments a free user most wants a plan are the
   moments nothing offers one.
3. **When does a day end?** The diary is one fixed list. No rollover, no yesterday, no history.
   This decides late-night logging, travel days and the streak.
4. **Does a fully skipped day keep a streak?** Skipping is deliberately gentle, which leaves a
   whole day of skips ambiguous. It needs a rule, stated to the user in plain words.
5. **Move and Mind on the free Home** look tappable and go nowhere. The Metabolic Kickstarter
   card has no destination.

---

## 7. Working habits that keep this project sane

- **Split the code so each change touches one small file.** If a change means editing four
  files, the thing being changed probably wants to be its own component.
- **Comment the why, not the what.** The comments in this codebase explain the decision behind
  a piece of layout, because the layout itself is readable. Keep that.
- **Verify visually.** Run the dev server, drive the control panel, look at the screen. The
  smoke test proves it renders, not that it is right.
- **Do not touch `/v0` or `/v1`.** They are frozen for comparison.
- **Do not push or deploy until asked.**
