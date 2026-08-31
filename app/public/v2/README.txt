Frozen snapshot of the wireframe, served at /v2.

Built from commit 1bd3859 ("Quieter rows: fewer tips, one control, one phase
open"), the last state before the day counts were unified. It is a plain static
build with base=/v2/, so it shares nothing with the live app and is unaffected
by any later change to src.

This is the ring version: the four EM3 pillars sit in one strip with a progress
circle drawn round each icon and "2 of 5" underneath, on Home's Today's focus
card and again at the foot of To-do. The commit after it, 3a4987e, replaced
both with a single card and one day count, because the same day was being said
in five denominators at once.

Do not edit these files. To rebuild this snapshot:

  git worktree add --detach /tmp/wt-v2 1bd3859
  ln -s "$PWD/node_modules" /tmp/wt-v2/app/node_modules
  cd /tmp/wt-v2/app && rm -rf public/v0
  npx vite build --base=/v2/ --outDir dist-v2
  cd - && rm -rf public/v2 && mkdir -p public/v2
  cp -R /tmp/wt-v2/app/dist-v2/. public/v2/
  rm -rf public/v2/v0 public/v2/v1 public/v2/scenarios
  git worktree remove /tmp/wt-v2 --force

That rm of public/v0 matters: public/ is copied into every build, so a snapshot
taken without it would contain a copy of another one inside itself.
