Frozen snapshot of the wireframe, served at /v4.

Built from commit cb7b7e4 ("The metabolic score becomes a walkthrough"), which
was also the working tree at the time, so this is the state anybody saw on
2 Sep 2026 with nothing left out. It is a plain static build with base=/v4/,
so it shares nothing with the live app and is unaffected by any later change
to src.

This is the four part day and one logger per pillar. The day runs Morning,
Afternoon, Evening and Night on Indian hours, with shaam starting at four and
dinner filed under raat. Eat's logger opens on the coach's option with the
food already picked, and Kaira reads a photo or a sentence into it. Move
records the coach's routine as one session with an answer about how it felt.
Mind has a plan of its own, so the handover is three plans and the day gives
Mind at most two rows. Home carries the four pillar scores under the day, the
metabolic score runs five steps of its own, and the consultation everything
waits on can be booked.

/v3 is the version before all of this, and the one to open for anything about
the three part day or the two plan handover.

Do not edit these files. To refresh this snapshot to the current source:

  rm -rf public/v4 dist-v4
  npx vite build --base=/v4/ --outDir dist-v4
  mkdir -p public/v4 && cp -R dist-v4/. public/v4/ && rm -rf dist-v4
  rm -rf public/v4/v0 public/v4/v1 public/v4/v2 public/v4/v3 public/v4/scenarios

The first rm matters: public/ is copied into every build, so a snapshot taken
without it contains a copy of the old one inside itself. The last line drops
the other snapshots, which the build copies in for the same reason.
