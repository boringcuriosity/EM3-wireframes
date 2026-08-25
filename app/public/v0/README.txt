Frozen snapshot of the wireframe, served at /v0.

Built from the source as it stood on 25 Aug 2026 and committed as-is. It is a
plain static build with base=/v0/, so it shares nothing with the live app and
is unaffected by any later change to src.

Do not edit these files. To take a new snapshot, make a new folder (public/v1
and so on) rather than overwriting this one:

  npx vite build --base=/v1/ --outDir dist-v1
  cp -R dist-v1/. public/v1/ && rm -rf dist-v1 public/v1/v0

That last rm matters: public/ is copied into every build, so a snapshot taken
now would otherwise contain a copy of this one inside itself.
