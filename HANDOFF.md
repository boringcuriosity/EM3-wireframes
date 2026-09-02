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

### The six URLs

| Path | What it is |
|---|---|
| `/` | the live wireframe, where all work happens |
| `/v3` | a **frozen snapshot** of the three part day: Morning, Afternoon and Evening, Eat's logger with no plan tab, Move recording the routine as four ticks nothing read, no Mind plan, two plans in the handover. Built from commit `38a575c`. Served from `app/public/v3/`. Its README carries one caveat: it is the last **committed** state, and the morning of 31 Aug also held uncommitted work that is absent here. |
| `/v2` | a **frozen snapshot** of the ring design: the four pillars in one strip with a progress circle round each icon and "2 of 5" under it, on Home's Today's focus card and again at the foot of To-do. Built from commit `1bd3859`. Served from `app/public/v2/`. |
| `/v1` | a **frozen snapshot** of the diary design: chronological To-do, one card on Home, the plan handover card, the two device syncs, the weekly read. Served from `app/public/v1/`. |
| `/v0` | a **frozen snapshot** of the older pillar-grouped To-do, from before the diary rewrite. Served from `app/public/v0/`. |
| `/scenarios` | working notes: every user moment in To-do, EM3 and the streak, written as open questions, with a suggestions tab. Static HTML in `app/public/scenarios/index.html`. |

The snapshots are in age order: `/v0` groups the day by pillar, `/v1` turns it into a diary,
`/v2` sits between them in spirit, holding the moment the four rings still carried the day's
numbers, and `/v3` is the day before it gained a Night. `/v2` is the one to open when somebody
asks where the progress circles went; `/v3` is the one for anything about the four part day, the
pillar loggers or the three plan handover.

A snapshot that is not committed is not deployed. `app/public/v2/` sat untracked for days, so
the live site served nothing at `/v2` while the folder existed happily on one laptop. Check
`git status --short app/public` after building one.

**Never change a snapshot as a side effect of anything.** Refresh one only when explicitly
asked. Each carries a `README.txt` with its own recipe; they look like this:

```bash
rm -rf public/v1 dist-v1
npx vite build --base=/v1/ --outDir dist-v1
mkdir -p public/v1 && cp -R dist-v1/. public/v1/ && rm -rf dist-v1
rm -rf public/v1/v0 public/v1/v2 public/v1/scenarios
```

The first `rm` matters: `public/` is copied into every build, so a snapshot taken without it
contains a copy of the old one inside itself. The last line drops the other snapshots, which
the build copies in for the same reason.

To snapshot a **past commit**, build it in a detached worktree with the installed
`node_modules` symlinked in, so the working tree is never disturbed and nothing is
reinstalled. This is how `/v2` was made:

```bash
git worktree add --detach /tmp/wt-v2 1bd3859
ln -s "$PWD/node_modules" /tmp/wt-v2/app/node_modules
cd /tmp/wt-v2/app && rm -rf public/v0 && npx vite build --base=/v2/ --outDir dist-v2
cd - && rm -rf public/v2 && mkdir -p public/v2 && cp -R /tmp/wt-v2/app/dist-v2/. public/v2/
rm -rf public/v2/v0 public/v2/v1 public/v2/scenarios
git worktree remove /tmp/wt-v2 --force
```

In dev, `/v0/`, `/v1/`, `/v2/` and `/scenarios/` need the explicit `index.html` (Vite's SPA
fallback answers the bare directory with the live app). On the deployed site the bare paths
work.

### Deploying

```bash
cd app
npx vercel --prod --yes --scope boringshaheer-gmailcoms-projects
```

The `--scope` flag is required: `app/.vercel/project.json` records a team org id but the
project actually lives under the personal scope. Live at
**https://em3-wireframes.vercel.app**. Repo: `boringcuriosity/EM3-wireframes`, branch `main`.

**Pushing does not deploy.** There is no GitHub integration on this project: a push updates the
repo and leaves production exactly as it was. The site only changes when the command above is
run. On 31 Aug that gap left `/` serving the previous build and `/v2` and `/v3` returning 404
while both sat committed on main.

Check a deploy rather than assuming it: `curl -s -o /dev/null -w "%{http_code}" <url>` on each
of the six paths, and compare the bundle hash at `/` against `app/dist/assets/`.

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
- `dayPhases` — the same rows grouped into the parts of the day, three or four
- `planAssigned` — `plan === "paid" && kcalSource === "coach" && !!movePlan`
- `heroState` — what the top of To-do shows, from the plan and the day
- `celebrated` — which rows have already played their finish animation
- `HOME_CARDS` / `HOME_TABS` — the Home carousel and its chips: program, any open
  prerequisites, sessions, and a live session when one is scheduled

If you find yourself writing the same number in two components, stop and derive it.

### The day model — `screens/today/day.js`

The whole To-do screen falls out of one array. Every row carries `at`, a minute of the day;
the phase is derived from that single number, so nothing has to be filed by hand.

```js
export const phaseOf = (at, mode) => { /* first span whose `from` the minute has passed */ };
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

The panel is the map of the product, and it is the thing the user actually drives. Every
screen, every state, every variant under consideration is a chip in it. **A state with no chip
does not exist**: the user demos from the panel, and `npm run smoke` walks it to decide what to
render, so an unlisted state is both undemoable and untested.

Three pieces make it up:

- `ALL_GROUPS` — every group, in order.
- `SCREEN_GROUPS` — which groups matter on which screen, so the panel filters itself to what
  you are looking at. A line at the foot of the panel switches between the current screen's controls and all of them.
- `panelGroup(id, title, appliesTo, chips, caption, stack)` and
  `panelChip(label, active, onClick, title, expanded, sub)` — the two helpers everything is
  built from. `appliesTo` is the human note under the group title ("To-do, the day's list").
  `caption` is the line under the chips that explains what the currently selected state means,
  usually written as a lookup keyed by the active id.

Write the descriptions properly. They are read far more often than the code, and they are how
the user decides between variants without opening the app. Each chip's `title` says what that
option is; the group `caption` says what you are looking at right now and why it was built.

Groups that hold live design decisions rather than data states:

| Group | What it switches |
|---|---|
| `taskcard` | the eight To-do task layouts (below) |
| `homecard` | the four shapes of Home's Today's focus card |
| `hero` | what the top of To-do says, given the plan and the day |
| `planarrive` | the plan handover card, plus the push and the WhatsApp thread |
| `weekread` | the weekly insight, off / ready / read, as three tasks or one sheet |
| `skip` | which rows are skipped today |
| `focus` | how much of the day is already done |

---

## 4. The design language

Fonts: **Playfair Display** for display type, **Roboto** for everything else, both loaded in
`index.css`. They are the product's own faces; do not swap them.

**Bottom sheets are Roboto only.** No Playfair inside a sheet: titles carry their weight with
size and `fontWeight: 800` instead. Sheets also have no drag handle at the top, and their panel
carries `overflow: "hidden"` so a first child with its own background cannot paint over the
26px top corners.

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

### Task titles are a verb and a name

Every task in the app is composed, never written twice. A row carries a **name**, the thing
itself, and a **category**, which is what finishes the task. The category decides the verb.

| Category | Verb | What finishes it | Tasks |
|---|---|---|---|
| `record` | **Log** | a record goes in, on this screen or another | the six meal slots, last night's sleep, the exercise session, 20 minutes of movement, the three main meals |
| `device` | **Sync** | a reading arrives from a device | the BCA sync, the CGM sync |
| `insight` | **Read** | Kaira has written the week up | the three weekly reads, the one week sheet |
| `habit` | **Take** | done in the moment, with nothing to file | the calm break, the breathing break |

A row sets `verb` directly for the handful of asks that are their own action, where nothing is
filed afterwards: **Drink** 2 glasses of water, **Walk** 10,000 steps (only once a plan sets
that number), and the coach's three
nudges, **Drink** warm water with methi, **Get** 10 minutes of morning sun, **Soak** 5 almonds
for tomorrow.

`taskTitle()` in `screens/today/day.js` joins the two and lowers the name's first letter, so
`{ cat: "record", name: "Breakfast" }` becomes **"Log breakfast"**. That is the only place a
title is made.

Two reasons it works this way. **The verb is fixed per category**, so the list teaches its own
grammar: anything that ends with a record opens with Log, every device with Sync, and a row's
first word already says what sort of work it is. And **a confirmation says the name, not the
ask**: the done toast reads "Done for today, Breakfast", never "Done for today, Log breakfast".
Adding a task means giving it a name and a category, and both readings come out right.

The Eat screen keeps the plain slot names for its own section headings, where a section is a
place rather than a thing to do.

---

## 5. Where the product currently stands

### To-do is a chronological diary

The big change this cycle: To-do used to be four pillar sections. It is now **the day in the
order it happens**, grouped Morning / Afternoon / Evening / Night, with the pillar riding along as the
colour of each row's circle plus a small pillar chip after the title, tied to the last word so
it follows the text when a title wraps. One phase is open at a
time: the earliest one still with something in it.

`/v0` still holds the old pillar-grouped version for comparison, and `/v1` freezes this diary
design as it stands.

### Four parts of the day, on Indian hours

`PHASE_MODES` in `day.js` holds both splits and `phasesFor(mode)` picks one; `phaseMode` in
state is 3 or 4 and defaults to 4. **Evening vs Night** switches them; it is off both screen
lists now and lives under **Show all controls**, because it is a decision that gets made once.

The four are the four an Indian day already has names for: subah, dopahar, shaam, raat.
Morning from 5 AM, afternoon from noon, **evening from 4 PM**, night from 7 PM. Shaam starts
with tea rather than at the six most apps assume, and the evening meal is raat ka khana, night
food, so dinner belongs to Night.

Three things this moved:

- **The sleep row left minute zero.** It sat at `at: 0` to sort first, which was harmless while
  the day began at midnight. With a day that turns over at 5 AM, midnight is the night still
  running, so the row about last night filed itself under tonight. It is at 5:00 AM now.
- **A phase carries its own `when`.** Home writes "2 more this evening" off the phase, and
  "this night" is not something anybody says. Each phase holds the phrase, and Night's is
  "tonight".
- **The coach's session moved to 6:30 PM.** At 7:00 it landed on the Night boundary and left
  Evening holding one row. Half past six keeps the round 7 PM line and reads truer anyway: a
  workout is something you do before dinner. It is 30 minutes now, and its subtext is generic,
  because the routine itself is on the Move screen and a row that counted the moves would be a
  second copy going stale the moment a coach changed one.

The planned day comes out 6 / 2 / 2 / 5, the free day 2 / 2 / 2 / 3.

### Eight ways to draw a day, all live in the panel

How a task should look is **an open decision the user is still making**. Rather than argue it
in prose, all eight candidates are built and switchable from **To-do layout** in the panel.
Nothing here is dead code to delete: it is the comparison itself.

| Chip | The idea |
|---|---|
| Rows | tight rows inside one card per part of the day. Shortest list, least room per task. |
| Card, badge on top | pillar mark and pay across the top, task under them. Easiest to scan by pillar. |
| Card, badge inline | mark, title and pay on one line, body underneath. |
| Card, icon in the circle | the circle carries the pillar until it is ticked. No badge at all. |
| Timeline | one spine down the left, times in a single column, cards hanging off it. |
| Timeline with now | the same spine, marked where the clock is. Solid behind you, dashed ahead. |
| Next one open | the task in front of you is a card, everything else is a line. |
| Done settles | cards, but a finished task shrinks to one dim line as the day goes. |

Two things learned while building them, worth keeping if you touch this: the timeline dots need
their own fixed rail column to sit on the line (aligning them by margin drifts the moment a
title wraps), and tips need the same white card as everything else, because a tip drawn as bare
text reads as a caption on the row above it.

Task cards can show what a task pays, as `+10`. **Tips never pay**, because a nudge you read is
not work you did.

### One card owns the day

Home's **Today's focus** is a single card: a slim streak line with a bar, the next two tasks,
"x more tasks left today", then a **Metabolism** section of four cards as the way into each
pillar. To-do carries the same streak bar under its heading. When the day is finished, both
show the same "We are proud of you" card.

Three other shapes are still switchable from **Home card shape** in the panel while the user
decides: Up next, This part of day, Next task. The last two still render `Em3Strip.jsx`, the
four pillars in one strip with a progress ring round each icon. The rings survived the
consolidation; the fractions under them did not, because the bar above already owns the day's
arithmetic. `/v2` is the snapshot of the version where both were there.

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

It starts before the app. A plan is written while the person is somewhere else, so the first
things they ever read about it are a push and a WhatsApp message, and neither had been looked
at beside the screens they introduce. Both live under **Plan assignment** in the panel as
two icon chips, a bell and a speech bubble, and are reachable from nowhere else, because
neither is a screen in this app. `panelChip` takes an optional icon for the handful of chips
whose label runs longer than the thing it names; the label stays as the key and the accessible
name. Both take the whole frame
with no tab bar and no Kaira.

`screens/PlanNotification.jsx` is the WhatsApp thread, **both messages verbatim**, diet and
exercise, em dashes and all, down to the lower case "chandra" in the first and the hyphen where
the second means an em dash. Do not tidy it. The project's copy rules govern what we write; this
is a record of what is being sent, and a rewrite is only worth arguing about next to the real
one. `[[...]]` in the copy marks the spans WhatsApp linkifies, which is why the dates in the
first message look different from the same dates in the second.

`screens/PushNotification.jsx` is the one that lands face up on a table, so it is two lines and
a name on a lock screen:

> **Your diet plan is ready**
> Sahana planned your meals. Tap to see today's.

It names the coach, because that is the part worth waking up for, and it carries no date and no
duration: the long version has those, and a push that lists them spends its one glance on
arithmetic. Tapping it opens the day.

Both are drawn in our own neutrals rather than as forgeries of WhatsApp or of a lock screen.
The job is to read the message, not to fake the phone around it.

`careTeam` moved into `state.jsx` while doing this, so the push, the program page and anything
else that names a coach cannot name different people.

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
the panel under **Weekly trend insight**: three reads spread across the day (sleep in the morning,
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

### The three dots, and what a row can still be told

Three dots on any row open `DayRowSheet.jsx`, which asks one question and gives two buttons.
Which question depends on where the row stands, because a single menu of every possible action
turns thirteen asks into twenty six decisions:

| The row | The question |
|---|---|
| not done | "Not doing this today?" — skip |
| skipped | "Put this back on today?" |
| done, and the tick is the whole record (a coach tip) | "Mark this as not done?" — undo |
| done, water counted up | take a glass back off |
| done because a record exists elsewhere (a meal, a session, a sync) | the way to that record, "Go to Eat" |

The split matters. Undoing a tip is a genuine one step reversal. Undoing a logged meal would
mean deleting data the user entered on another screen, so the sheet offers the door to where
the record lives instead of pretending it can undo it. Skipping disappears once a row is done,
because declining what you have already done says nothing.

A skipped row fades, its circle goes to a dash, and it leaves the day's count and the phase
total, so nothing reads as missed.

### The coach's nudges

Three small tips sit in the day, and they are deliberately things already in the house: warm
water with methi at 6:30 AM, ten minutes of morning sun at 7:15 AM (Mind, not Eat, because a
nudge belongs to the habit it serves), and soaking five almonds at 10:30 PM. They replaced two
capsule reminders, which asked the user to have bought a bottle first.

The afternoon currently has no tip. A post-lunch walk is the obvious candidate and is waiting
on the user's word.

### A tip is not a task, and now it says so

On the day's list a tip and a meal were the same row. They are not the same kind of ask: a
meal is finished by a record landing in Eat, a tip is finished by doing it and ticking it,
with no screen behind it. Tips also never pay, so the coin slot on those rows was simply
empty, and an absence is a weak way to say something.

An **info mark** says so instead, and it is deliberately grey. All four hues belong to a
pillar, so the first version in gold read as a Measure mark sitting on an Eat row. The rest of
the palette is no better: amber means something needs attention, red means something is wrong,
and a tip is neither. The mark is the shape, not the colour.

It rides **with the pillar chip**, inside the title's own nowrap so the pair travels onto the
last line of a wrapping title together. Bare where the pillar chip is filled: the glyph draws
its own ring, and inside a chip it turned into a bullseye at 18px. The two marks are what the row
is, its habit and its kind, read in one place. Parked at the end of the row instead, next to
the three dots, it read as a second way to open the menu. Every task layout puts it beside
whatever carries the pillar there, from the shared parts, so it survives whichever layout is
picked.

Tapping it opens `CoachTipSheet.jsx`, which is four things: the row's name, one headline, one
line naming the coach, and the button. It used to also explain how a tip differs from a task
and repeat the coach's line underneath. Both went: the sheet was reading the screen back to
somebody who had just tapped it.

The trailing cluster on a row, the hour and the three dots, is pinned to the first line rather
than to the middle of the block. A title that wrapped used to drag its hour down, so on a list
where some titles run to two lines the column of times came apart.

The button hands over to `KairaChatSheet.jsx`, opened on the question already sent. `askAbout()`
in `day.js` composes it off the title the same way `taskTitle()` composes the title, so
"Soak 5 almonds for tomorrow" becomes "Tell me why I should soak 5 almonds for tomorrow."
She thinks for a beat and answers in two bubbles. The answers live in `ANSWERS` in that file,
one per nudge, and a row without one falls back rather than showing an empty thread.

Two rules held while building it. Reading is not doing: the chat pays nothing and leaves the
row open, unlike the weekly read which is a task in its own right. And Kaira still never
narrates: each answer is a mechanism the person did not know, never a recap of the line above
it.

Eat shows the same nudges under its own "Tips from your coach" heading, and carries the same
mark in the same place: beside the name, opening the same sheet. It was a worded **Why this
helps** button under the tip for a while, which made a three line row out of a two line one and
labelled what the heading above had already said.

Still to do: `KairaFab`, the floating hexagon, has never had an action. Now that a chat sheet
exists it is the obvious thing to wire it to, which needs a state for a chat opened with
nothing asked yet.

### Logging a planned meal is one tap now

Tapping "Log breakfast" used to open **Eat**, scrolled to Breakfast. From there each plan item's
circle opened the logger with that one item, and the logger's own list is Favourites and
Frequent, neither of which knows what a coach planned. So you asked to log breakfast, got sent
to a different screen to find breakfast, and then had to search for your own plan by name.

Now every route lands in the same place: **the logger, opened on the coach's option with the
food already picked.**

- `openMealLog(division, oi, only)` in `state.jsx` is the single opener. Three doors call it:
  the meal row on the day's list, **Log all** under an option in Eat, and the circle beside one
  line of that option, which passes `only`. Without `only` the whole option goes in **minus
  anything already logged**, so a half eaten option offers the rest rather than asking twice.
- `LogMeal` gets a third tab, **Your plan**, and lands on it. The logger already draws an item
  with a green stepper when it is in the meal, so the plan's items arrive visibly picked. The
  tab only exists when a plan sent you there.
- **Log all** appears under an option with more than one thing left. With a single item
  outstanding the circle beside it already is that button.
- `openRow` for a meal row calls the opener with `r.oi`, the option the row was showing, which
  is what makes the right one selected by default.

Nothing is recorded until the logger's own button. That keeps one meaning for "logged" across
the app and leaves room to drop the thing you did not actually eat.

Two supporting changes:

- **`logReturn`** records where the logger was opened from, and the result screen puts you
  back there. It used to land everybody on Eat, which is right for somebody who started there
  and wrong for somebody who tapped a row on their day and wants the list back with that row
  struck.
- **`goToRecord()`** is the three dot menu's path, separate from `openRow`. A finished meal's
  "Go to Eat" opens Eat, because there is nothing left to log. The row's own tap opens the
  logger. Two different questions, two different answers.

`DIVISION_TIME`, the hour each meal defaults to, moved from `EatDetail` into `foods.js`, since
the day's list opens the logger too and two copies of those six numbers would drift.

The same shape is what Mind wants next: one opener, one pre-filled destination. Move has it
already, below.

### Move had two ways to record one thing, and one of them recorded nothing

`LogExercise` wrote a real log. The coach's routine had a **Mark done** pill on each of its
four exercises, writing to `routineDone`, which **nothing else in the app read**. Somebody
could do exactly what their coach asked, tick all four, and watch the day's session row stay
open, the hero say nought minutes, nought workouts, nought kcal, the trend stay empty and no
Flipcoins arrive. The app told them they had done nothing.

The fix is not a second logger. It is admitting that **a routine is one thing you did, not
four**: the four exercises are its contents the way a meal's items are the contents of a meal.
So the routine became one more entry in `EXERCISES`, `id: "routine"`, MET 2.8, tagged `coach`,
named from a shared const so the plan and the log cannot call it different things. Everything
downstream then works with no special case: the minutes, the burn, the hero, `LoggedList`, the
trend, the day's row and the coins.

Around that:

- **`openMoveLog(id)`** is the Move twin of `openMealLog`. The day's session row passes
  `"routine"`, so a tap lands on the confirm with the routine picked and the effort already
  Light, one tap from done. The free day's row passes nothing and gets the pick list.
- **The picker gained a pinned Your plan section**, headed rather than tabbed: there is one
  plan and a short list, and two headings say so in less room than a tab bar.
- **`routineDone` finally does work.** Tick two of the four inside Move and the plan card in
  the logger reads "2 of 4 ticked off", so working through the exercises is visibly part of
  logging the session rather than a parallel list.
- **RoutineList used to carry Log this session.** It has gone: **Log exercise** already sits at
  the top of the same screen and opens the same logger, and two CTAs one scroll apart made the
  screen look like it wanted two different things. Working through the exercises is all the list
  does now; the one-tap route to the coach's routine is the session row on To-do.

One thing that bit twice while building, worth keeping: nothing in Move should open Move by
itself. `openMoveLog` leaves `moveDetail` alone, because `logExOpen` already wins over it in
the takeover order, and `MoveLogged` reads **`moveReturn`** rather than assuming. Both versions
that got this wrong sent somebody who had never answered the steps question to a permission
gate about steps, straight after logging an exercise.

### Move's logger, on Eat's shape

| | Eat | Move |
|---|---|---|
| Where the plan is shown | EatDetail, meal by meal | MoveDetail, full list **or** a card |
| Where you commit | LogMeal, **Your plan** tab | LogExercise, **Your plan** tab |
| The other tab | Favourites / Frequent | **Log other exercise** |
| Arrives pre-selected | the option's items | the session, ready to mark |
| Primary CTA | Log meal | **Mark all done** |
| Success screen | `MealLogged`, score rising | `MoveLogged`, minutes rising |

**The asymmetry is deliberate.** A meal's portions are the person's to state, so Eat confirms
them. A routine's length is the coach's: four exercises at two sets each is a prescribed
duration, and asking "how long?" makes somebody do arithmetic the plan already did. So
`COACH_ROUTINE` carries `minutes` and the plan tab commits in one press, while **On your own**
keeps the minutes, effort and time confirm, because only the person knows their walk was 25.

The button says the same thing whether nothing is ticked or everything is, because in both
cases it logs the whole session. Arriving and pressing it is the common path: most people open
this having just finished. It reads "Mark 3 done" only when some were left out, and the minutes
go pro rata, because logging the full twenty for half the work is a number the trend has to
live with afterwards.

`MoveLogged` is `MealLogged`'s four beats: the rise, what was in it, where the day stands, what
happens next. The number that climbs is minutes against the day's twenty, drawn as a ring
rather than Eat's hexagon, because a fraction of a goal is what the rest of Move already draws
with a ring.

### How it felt, which is the half of the loop that comes from the person

A physio needs one thing back from a routine: whether it was pitched right. Easy means step it
up, difficult means scale it back, and without it the next routine is written blind. So the
question is not admin, it is the other half of the conversation.

**The question waits for the act.** It sat open under every exercise for a version, which meant
four cards each dangling a query, and asking how work felt before anybody had done it. **Mark
done** is what raises it now, so it is asked at the only moment it has an answer.

**It arrives over the card, not over the screen.** `RoutineExercise.jsx` draws the overlay on
the exercise it is about, at 96% white so the thing in question stays faintly visible
underneath. A sheet would take the exercise away in order to ask about it, and cost somebody
their place in a list they are working down.

**The star earns its place.** It marks the one thing a physio cannot get anywhere else, and the
line under it says so, because a star on its own is a rule without a reason.

**One component, both screens.** `RoutineExercise` is rendered by Move's own list and by the
logger's plan tab, so Mark done and the question are the same by construction rather than by
discipline.

**Nothing is drawn before it means something.** There is no circle on an exercise nobody has
done: an empty one sat where a control should be, doing nothing, competing with the Mark done
button that was the actual affordance. Once done the circle is the tick, and tapping a tick to
clear it is the one gesture nobody has to be taught, so that is the undo. The answer stays
beside it as a chip, which is the way back into the question rather than out of it. Two
controls, two jobs, both on the header row.

**The cards mark, the bar logs.** Nothing else. There was a Mark all done for a while, first as
the bar's own button and then as a shortcut in the header, and both readings were the same
button in two places: a routine of a single exercise made that impossible to miss, because Mark
done on the card and Mark all done in the bar were the same tap two hundred pixels apart, and
once you had used one the other read "Mark 1 done" about a thing already done.

So the bar is **Log**, disabled until something is marked, with "Mark what you did" where the
numbers go so the disabled state explains itself. One rule, and it reads the same for a routine
of one as for a routine of ten.

The session's own reading is the answer they gave most often on the way through, and everything
marked has an answer, because answering is what marks it.

**They hear about it.** The result screen says what the answer buys: "You found this one
difficult, and Manya will see that before she writes the next one. Holding the same routine
another week is a normal answer." A question you answer and never hear about again is a toll
rather than a conversation, and a difficult session should never read as a failed one.

Two options, easy and difficult, because that is what goes out today. Worth revisiting: a
binary makes somebody pick a side when "about right" is the most common honest answer, and a
third option would stop that noise reaching the physio.

### Health Connect is one permission, asked once

Move gated on `steps === null` and Mind on `sleep === null`, so the same grant was asked for
twice. Granting Health Connect in Move hands over steps, workouts **and** sleep in the same
breath, so `pickSource` now fills the other signal in behind the person and that screen's gate
never appears.

Two rules keep it honest:

- **Only when nobody has decided.** Somebody who chose to log steps by hand made a choice, and
  connecting later for sleep does not quietly undo it.
- **Declining is per signal.** Saying you will count your own steps says nothing about your
  nights, so the other pillar still gets to ask once.

The panel's two "Health Connect permission" chips reset **both** signals, because "nobody has
been asked yet" is now one state rather than one per pillar.

### The handover is three plans, not two

A consultation produces a diet plan, an exercise plan and a **Mind plan**, and the third was
missing from `PlanCard` entirely, so somebody waiting on their psychologist had nothing telling
them it was coming. `mindPlan` is its own state and it gates Mind's worksheets rather than
`planAssigned`, because worksheets need the person who writes them.

**The waiting state had three problems, and the sentence was only one of them.**

It read "Your plans are written after your first consultation. Log the tasks below so your
coaches can see how you eat, move and sleep." Two actions in one paragraph, which made the
reader decide which of them mattered. The answer is that **booking blocks and logging does
not**, so they are split by hierarchy rather than crammed into one body:

> **Your plans start with a consultation**
> Log the tasks below so your coaches can understand how you eat, move and sleep, and curate a
> plan that fits you better.
> **Book your consultation →**

The heading was **"Your plans are on the way"**, which reads as somebody else already working on
it when nothing starts until this person books. And the card was **inert in exactly that state**,
so the one thing that would unblock them sat two taps away behind an info dot. It carries the
link now.

The one-plan-in line turns plural on its own, so "still writing the other" becomes "other
coaches are still writing" when two remain.

The third chip is **Wellbeing plan** rather than Mind plan. The pillar name is what the app
teaches, but a plan is a thing somebody receives, and wellbeing is the word for what this one
is trying to move.

### Booking the consultation everything waits on

`PlanWaitSheet` laid out the sequence, ended on the consultation, and then left the one thing
anybody could do about it off the screen. The consultation was also a clause inside step two,
"they arrive at your consultation already knowing", which buried the gate inside a sentence
about somebody else's reading. It is **its own step** now, and the sheet closes on which step
is waiting on whom, then a text link into `screens/BookAppointment.jsx`.

One screen, two steps, the way the movement logger picks then confirms: **who** you are seeing,
then **when**. A separate screen for the calendar would be two back buttons for one decision.

- The list is the three people from `careTeam`, **name first, role second**. A card that leads
  with the role is a directory; the program is people.
- The week strip dots the days with something free, so the strip says where to look before
  anybody taps to find out. A day with nothing open is dimmed and says so in her own words.
- **Booking lands back on the list**, with that card carrying the slot and a pencil. Three
  consultations get booked in one sitting, so leaving for Home after the first made somebody
  find their way back for the other two. The pencil reopens the picker on what was booked, and
  the button reads "Move to" rather than "Book".
- `bookings` is a map by coach. Home's session card derives from it as **the soonest one**,
  rather than being stored a second time, so the card and this screen cannot disagree about
  what is next.

### The metabolic score is a walkthrough, not a tick

`PrereqCard.go()` marks a prerequisite done the moment you tap it, on the theory that tapping
through **is** doing it: nobody books a lab test and then also ticks a box to say so. That still
holds for the diagnostics and the assessment, both of which hand off to another screen.

It does not hold for the score, which now runs five steps of its own in `screens/score/`. Marking
it done on the tap would have finished it before it started, so `Result` marks it and the tap only
opens the flow.

`ScoreFlow.jsx` is a router keyed on one `scoreFlow` value, the same shape as `SufficiencyFlow`,
so the panel opens any step cold rather than making you walk the whole thing:

```
intro -> focus -> profile -> review -> working -> result
```

- **intro** names all four parts and shows Diagnostic already shut. Saying so up front is the
  point: a score that turns out at the end to have been a quarter missing reads as a bait, and
  the missing quarter is the part that costs money.
- **focus** is the one question about the person rather than their measurements. It steers what
  the coaches read first and gates nothing, which the line at the foot says out loud, because a
  question that quietly narrows a score is one people answer strategically instead of honestly.
- **profile** asks one at a time with a bar. Five on a screen is a form and a form gets skimmed.
  The fields are drawn filled rather than as live inputs: the answers are staged, and a caret
  that does not accept a keystroke is worse than a field that never claimed to.
- **result** prints `metabolicScore`, which is **derived** as the sum of `SUB_SCORES`, so the
  total cannot disagree with the four figures printed beside it. The shut quarter keeps its
  place rather than being left out, so 277 visibly is three quarters of something.

**Biomarker is the lab test.** The result's "Book diagnostics" goes to the same place the `labs`
prerequisite does rather than inventing a second booking route. One prerequisite, not two.

The figures are staged on purpose. A form that genuinely collected height and weight would move
`BODY`, and `BODY` drives BMR, TDEE, the calorie target and every macro under it. Those numbers
belong to the coach's plan, not to a demo walkthrough.

### Live sessions are not consultations

The Home carousel carries a fourth card and tab. Nobody books a live session, it is not yours,
and it runs whether or not you turn up: a specialist takes an hour for everybody on the program.
That is why it gets its own card rather than joining the queue of things you have booked, where
every other entry is a slot with your name on it, and why it is drawn in the pillar's tint rather
than as another white card.

`liveState` is `one` or `none`, and `none` drops the card **and** the tab, the same rule Next
actions follows: a tab leading to nothing scheduled is worse than no tab.

The empty **No upcoming sessions** card was rebuilt in the same pass. Its CTA sat at the top
beside the faces, so it asked you to act one line before telling you what for, and it was the
only CTA on Home not at the foot of its own card. It now reads faces, then what is missing, then
why, then the ask, and the button is wired to `openBooking` rather than being decorative.

### Mind, on the same grammar

Mind's plan is not practices at hours the way Eat's is meals and Move's is exercises. It is
**worksheets a psychologist assigns**: a thing to think about and write down. So the record is
what somebody wrote, and filling one is what finishes it.

**Sleep stays Mind's core.** The hero is untouched, and because the app measures bed and wake
properly the coach's own Sleep Tracker worksheet is out: a weekly Yes/No beside a real
measurement is two answers to one question. The Weekly Habit Tracker is out for the same
reason, since habits across days is what To-do already is.

**`MIND_TEMPLATES` in `tools.js`** is the plan, and three shapes cover every worksheet, so a
new one is a data entry rather than a screen:

| kind | what it draws |
|---|---|
| `fields` | a list of written answers: SMART goal, Motivation check-in, Reframing a thought |
| `list` | something you add items to: the worry tree |
| `week` | a thing you fill a day at a time: the motivation tracker |

**Pre-session notes are a worksheet too**, so they get the same sheet with two fields and no new
machinery. `strip: true` draws them as a band across the top of her section rather than as a
sixth card, because they are the frame the rest sit inside: everything below is what she asked
for, and this is what you want to raise. The strip names the actual booked session when there
is one, since notes are for a particular hour rather than for the idea of a next time. Their
cadence is `session`, which is neither daily nor one-off, so they never land on the day's list.

`cadence` is the word the live version is missing. "Fill 1 time" says how often but never when,
and how often is what decides where a worksheet appears. `MindTemplateSheet.jsx` opens one from
its card on Mind. **Worksheets are not rows on the day**: a SMART goal is filled once and a
motivation check-in comes back every night, and between them they put two more Mind asks on a
day that already has sleep and the calm break. They are a plan artefact, so they live on Mind
where `ToolList` lists them and shows which are filled.

Each worksheet carries its own `Icon`, its own `save` label and its own `task` label, so the
button names the thing rather than the person (**Save SMART goal**) and the day's row says it
the same way (**Fill your SMART goal**). Both are written out per template rather than composed,
because "SMART" survives no rule that changes a case: composing the row label caught this the
hard way and put "Fill your smart goal" on the list.

The panel's **Care plan** toggle assigns all three. A consultation produces three plans, so
"assigned" means three rather than the two it meant while Mind quietly stayed behind.

**The tools became a grid.** Four short peers you pick between rather than a sequence you work
down, so side by side they cost a third of the screen they cost stacked, and the psychologist's
list gets the room. The worksheets stay full width, because a cadence and a real name need it.

**No circle on either, and done says what was done.** Same move as Move: an empty circle sat
where a control should be, on a card that opens when you tap it anywhere. Finished, a card
reads "You felt Calm 😌", the affirmation you kept, the prompt you answered. "Done today" told
somebody what they already knew. `mindKept` holds all three, with `mindMood` as an alias off
it, so the hero and the panel keep reading what they always read.

Two things that went rather than got built. **"Your coach recommended this today"** showed above
the breathing exercise for people who had no coach, and split four short cards into two sections
in order to say something about one of them. And the prompt above the list, "Work through the
list below", was a sentence in a bordered box telling somebody to read the list they were
looking at; it now appears only when it carries the Log sleep button.

### The screen after a meal, cut to four things

`MealLogged` said the same day in five ways: a score, a line under it counting meals, a per
macro delta beside a per macro total, and a Kaira card at the bottom explaining the lock a
second time. The screen after logging a meal was longer than the screen that logged it.

Four beats now, in the order somebody wants them:

1. **which meal landed and when**, then either the score or the fact that it is waiting
2. **the four macros and the day's calories**, which `MacroRings` and `CaloriesStrip` already
   draw with a goal or without one, so those decisions were made and did not need making again
3. **how far off the score is**, as three filled segments rather than a sentence
4. **what was actually in the meal**

The confirmation used to be a caps badge reading MEAL LOGGED with the same fact repeated as a
line under the food, "Lunch at 1:30 PM". The badge became the sentence and the line went.

**One slot under the hexagon, two states.** Locked, it is the count that opens it; unlocked, it
is what the number means and what makes it truer. The unlock card used to sit below the macros,
which put the explanation of the lock two sections away from the lock.

Without targets there is **no hexagon at all**: a locked one promises that meals unlock it, and
what unlocks it is targets.

### Any three meals, not breakfast, lunch and dinner

`mainMealsDone` counted three named slots, so somebody whose day is a pre-breakfast tea, a four
o'clock snack and a late dinner was told they had eaten once. It is **`mealsIn`** now, the count
of distinct slots logged, whichever they are, and `MAIN_DIVISIONS` is gone.

The sufficiency card followed: its three pips used to be named Breakfast, Lunch and Dinner and
its copy told you which ones were missing, which said the real meals were the wrong ones. Three
anonymous segments and a count.

### Snap and voice, which the panel had been promising all along

The Food logging group's own note has read "from Eat, snap / voice / search" since long before
either existed. A camera and a mic now sit at the right hand end of the logger's search field,
and both are Kaira's, because reading a plate and hearing a sentence are the two things she is
for. Typing a meal is the reason most people log once and never again.

They stand down while there is a query, the way the tabs below them already do. Somebody who
has started typing has chosen their way in, and a clear button plus two offers is three
controls in the space of one.

`KairaLogSheet.jsx` handles both. Same shape either way: what you handed her, a beat while she
works, then what she found **as items rather than as prose**, and the one button that puts them
in the meal. It borrows `Mark`, `Bubble` and `Dots` from `KairaChatSheet` rather than drawing a
second Kaira.

Two things worth keeping if you touch it:

- **She does not log anything.** The items land in the meal being built, and the logger's own
  button still does the recording, so a photo she read wrong is corrected before it becomes a
  record rather than after. Same rule as every other route into the logger.
- **Items merge, they do not append.** Adding two rotis to a meal that already has one makes
  three. A second entry would leave the stepper editing one of them while the total counted
  both, which is the kind of split fact this project keeps having to hunt down.

The photo itself is a labelled placeholder, not a stock plate. Whatever ships there is the
picture the person actually took.

---

## 6. How a decision gets made here

This is a design project with a codebase attached, not the other way round. The pattern that
has worked, and that the user expects:

**Build the options, do not describe them.** When something is genuinely open, the answer is
several working variants behind panel chips, and the user picks by looking. Prose comparing
imaginary designs has been rejected more than once. When the user asks "suggest a few and I'll
pick", give a short numbered list they can answer with a single digit.

**Ask from the user's side of the screen.** Every change on this project has been argued in
terms of what a person sees and has to work out, not what the component does. "The same day was
being said in five denominators at once" is the kind of reason that lands. Before building,
say in one line what the person gains.

**One fact, one place, on screen as well as in code.** Derive-never-duplicate is a design rule
before it is an engineering one. The biggest change of the last cycle was collapsing a flame, a
total, a phase count and four pillar fractions into one bar, because they were all the same day.

**Gentle beats strict.** Skipping is a real answer. A day made smaller on purpose should look
smaller, never failed. Streaks are a reward for showing up, never a threat.

**The coach is a person.** Anything that can come from a named coach rather than from the
system should. Kaira supports that relationship, and she never narrates the day back: every
line she says has to carry something the user did not already know.

**Copy is design.** The rules in section 4 are not preferences, they are rejections the user has
already made. The negation rule in particular ("no this, no that", "this, not that") is caught
on sight.

**Verify by looking.** Run the dev server, drive the panel, open the actual screen at 390x844.
The smoke test proves it renders; only the screen proves it is right.

---

## 7. Open questions, not oversights

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

## 8. Working habits that keep this project sane

- **Split the code so each change touches one small file.** If a change means editing four
  files, the thing being changed probably wants to be its own component.
- **Comment the why, not the what.** The comments in this codebase explain the decision behind
  a piece of layout, because the layout itself is readable. Keep that.
- **Verify visually.** Run the dev server, drive the control panel, look at the screen. The
  smoke test proves it renders, not that it is right.
- **Do not touch `/v0`, `/v1` or `/v2`.** They are frozen for comparison. Check
  `git status --short app/public` before you finish: a stray diff there means a build leaked
  into a snapshot.
- **Do not push or deploy until asked.**

---

## 9. In flight right now

Committed through `38a575c` ("Seven ways to draw a day, switchable from the panel"). Nothing
after that is pushed, and nothing should be until the user says so.

**Recently landed** (everything below is committed; the list is here as a change log, not as a to-do):

- the state-aware row menu in `DayRowSheet.jsx` (skip / back / undo / less / open) and the
  "Go to Eat" wording
- the three coach nudges replacing the two capsule reminders, in `state.jsx`, plus `pillar` on
  a note so morning sun files under Mind (`screens/today/day.js`)
- the panel captions and presets that reference them
- the four-part day (`PHASE_MODES`, `phasesFor`, `phaseMode`), the **Evening vs Night** panel
  toggle, the sleep row's hour, and the phase `when` wording on Home
- the coach's session at 6:30 PM for 30 minutes, with generic subtext
- the one tap meal log: `openMealLog`, `logPlan`, `logReturn`, `goToRecord`, the logger's
  **Your plan** tab, Eat's **Log all**, and the **On the plan** panel chip
- snap and voice: `KairaLogSheet.jsx`, `kairaLog`, the camera and mic in the search field, and
  the **Photo** and **Voice** panel chips
- Move's logger on Eat's shape: the **Your plan** / **Log other exercise** tabs, the session
  with its videos and Mark all done, `MoveLogged`, `moveReturn`, and the shared
  `RoutineExercise` card with its overlay question and `routineFeel`
- one Move logger for both kinds of movement: the routine as an exercise in `exercises.js`,
  `openMoveLog`, `logExPick`, the pinned Your plan section, and **Log this session** in
  `RoutineList` (that button has since been removed, see above)
- the plan assignment notifications: `screens/PlanNotification.jsx` (both WhatsApp messages
  verbatim), `screens/PushNotification.jsx`, `planNotif`, `careTeam` lifted into state, and the
  **Push notification** and **WhatsApp messages** chips under Plan assignment
- the tip bulb, `CoachTipSheet.jsx`, `KairaChatSheet.jsx`, `askAbout()`, and the **Coach tip**
  panel group
- `app/public/v2/`, the ring snapshot
- every bottom sheet without its drag handle or its serif, and all 25 sheet panels clipping to
  their own 26px corners (`overflow: hidden`)
- TDEE at 2,200, reached through the persona so the sheet's worked example still adds up, and
  the empty Eaten orb as the way in to Eat
- `MetabolismCards.jsx`: the four pillars as slim score cards in a swipe rail, four layouts
  behind the **Metabolism strip** panel group, `pillarScores` derived in `state.jsx`. Every
  lock comes off the real day; Momentum and Wellbeing's figures are staged in one place because
  neither has a formula yet. **Gauge is the default**, so Home shows scores rather than tiles
  out of the box
- a quieter panel: no NOW SHOWING card, the scope switch moved to a line at the foot, Care plan
  as a real switch, and Day won / Skipped tasks / Coach tip / Streak strip off the screen lists
  but still reachable under Show all controls
- water as one tick rather than a counter with a bar, and both `DayRow` progress bars animating
  `transform` instead of `width`
- the Start here section as one card that opens and shuts (`PrereqRail.jsx`), shut by default
  once a plan lands rather than deleted from the screen: `prereqOpen` is tri-state, null meaning
  follow the plan. `PrereqHideSheet.jsx` says where they go before they go
- one calorie goal, not two. The To-do hero carried a hardcoded 1,885 while Eat carried the
  coach's 2,200, so the app answered "what should I eat today" differently depending on which
  screen you asked. Both read `kcalTarget` now and `HERO_GOAL` is gone
- Mind gives at most two rows a day: sleep and the calm break. The psychologist's worksheets
  came out of `buildDay`, and the `tpl:` routing in `openRow` went with them
- the step goal waits for a coach, and the Start here card appears on the program page too,
  above Care team, sharing To-do's collapse and cross
- `screens/score/`: the metabolic score walkthrough, five steps behind `scoreFlow`, and the
  metabolism prerequisite no longer ticking itself off on the tap that opens it
- Live sessions as a fourth Home card and tab (`liveState`), and the empty sessions card
  rebuilt so its CTA comes after the reason rather than before it
- one button shape for the small Home CTAs. Get my score, Book a slot and Start the chat were a
  different button entirely, one card along from Book a session in the same rail. They are also
  `inline-flex` now: `CtaArrow` sits 2px below the baseline, which dragged the label a pixel low
  inside its own padding
- Start here moved above Daily building blocks on the program page, so the page runs in
  dependency order: what is blocking, then what it unblocks, then the people waiting on it
- `check-state.mjs` no longer reads JSX prose as code. Its text sweep started at any `>`,
  including the one in `=>`, so every use between an arrow function and the JSX was invisible
  to it; the sweeps now exclude `=;()` and were tested in both directions

**Waiting on the user, in order:**

1. **Which task layout to keep.** Eight are built and switchable. This is the live decision;
   the others come down once it is made.
2. **Whether the afternoon gets a tip.** A post-lunch walk was offered.
3. **When to push.** The standing instruction is to batch and wait.
