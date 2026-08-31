Frozen snapshot of the wireframe, served at /v3.

Built from commit 38a575c ("Seven ways to draw a day, switchable from the
panel"), the last state before the four part day. It is a plain static build
with base=/v3/, so it shares nothing with the live app and is unaffected by
any later change to src.

This is the three part day: Morning, Afternoon and Evening, with Evening
running from five o'clock to bedtime and carrying half the list. Eat's logger
has no Your plan tab, Move records the coach's routine as four ticks that
nothing else reads, Mind has no plan at all, and the handover is two plans
rather than three.

ONE CAVEAT WORTH KNOWING

This is the last committed state, which is not quite the last state anybody
saw. On the morning of 31 Aug the working tree also held work that had never
been committed: the state aware row menu, the verb and name task titles, and
the three coach nudges. Those are absent here, so tasks read "Breakfast"
rather than "Log breakfast" and the coach's nudges are the two capsule
reminders they replaced.

Do not edit these files. To refresh this snapshot to the current source:

  rm -rf public/v3 dist-v3
  npx vite build --base=/v3/ --outDir dist-v3
  mkdir -p public/v3 && cp -R dist-v3/. public/v3/ && rm -rf dist-v3
  rm -rf public/v3/v0 public/v3/v1 public/v3/v2 public/v3/scenarios

The first rm matters: public/ is copied into every build, so a snapshot taken
without it contains a copy of the old one inside itself. The last line drops
the other snapshots, which the build copies in for the same reason.
