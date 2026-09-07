Frozen snapshot of the wireframe, served at /v5.

Built from commit 50238c2 ("The sandbox runs the rule the app runs"), which
was also the working tree at the time, so this is the state anybody saw on
7 Sep 2026 with nothing left out. It is a plain static build with base=/v5/,
so it shares nothing with the live app and is unaffected by any later change
to src.

This is the cycle where Home started asking questions. The four bubbles rank
on the day rather than on the score: the nearest unfinished row takes the
front, score only breaks ties, and every log hands the front to whatever is
genuinely next. Each one asks about the row it is waiting on, "Have you had
your lunch" rather than "Time to eat", because this is a logging app and the
question is the one a person can answer. Tips carry no weight anywhere on
that card, including in Momentum. The bubbles are lit spheres with liquid in
them, in three depths behind a panel chip.

Around it: KAIRA says one mechanism and nothing to do; the coach's plan is a
real day of food at 1,635 kcal against a TDEE of 1,900; sleep can be edited
whichever way the night arrived; Move gained a morning stretch and Measure a
body composition sync; and a first step now rides above every step of its own
flow as a strip, stays in the rail struck through once it is done, and
diagnostics has a screen of its own with the price struck to nothing.

/v4 is the version before all of this, and the one to open for anything about
the pillar score cards, the old score-led bubble rule, or Kaira's longer
lines.

Do not edit these files. To refresh this snapshot to the current source:

  rm -rf public/v5 dist-v5
  npx vite build --base=/v5/ --outDir dist-v5
  mkdir -p public/v5 && cp -R dist-v5/. public/v5/ && rm -rf dist-v5
  rm -rf public/v5/v0 public/v5/v1 public/v5/v2 public/v5/v3 public/v5/v4 \
         public/v5/scenarios public/v5/know public/v5/move

The first rm matters: public/ is copied into every build, so a snapshot taken
without it contains a copy of the old one inside itself. The last line drops
the other snapshots and the working notes, which the build copies in for the
same reason.
