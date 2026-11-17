/* Self-check for the Rhythm sandbox: node mind/sandbox-simple.check.cjs (from app/public)
   Loads the app's real v7/mind/sleep-rule.js and v7/mind/rhythm.js with the sandbox's engine, runs every preset and
   checks the score against the preset's expect, and that Sleep quality is always 70 and Self-care 30. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const here = __dirname, pub = path.join(here, "..");
const noop = () => {};
const el = () => ({ appendChild: noop, classList: { add: noop }, style: {}, set textContent(v) {} });
const ctx = { console, setTimeout: () => 0, clearTimeout: noop, Math, JSON, Object, Array, String, Number, Boolean,
  URLSearchParams, document: { createElement: el, head: { appendChild: noop }, getElementById: () => null, querySelector: () => null } };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["v7/mind/sleep-rule.js", "mind/sandbox-engine.js", "v7/mind/rhythm.js", "mind/sandbox-presets.js"])
  vm.runInContext(fs.readFileSync(path.join(pub, f), "utf8"), ctx, { filename: f });
let bad = 0;
for (const p of ctx.SBPRESETS) {
  ctx.SB.apply(p.plan, p.day);
  const r = ctx.SB.result(), w = r.w;
  const g1 = Math.round((w.hours || 0) + (w.window || 0) + (w.wd || 0)), g2 = Math.round((w.br || 0) + (w.me || 0) + (w.mood || 0));
  const ok = r.score === p.expect && g1 === 70 && g2 === 30;
  if (!ok) bad++;
  console.log((ok ? "  " : "X ") + p.id.padEnd(9) + String(r.score).padStart(4) + "   sleep quality " + r.sqOwn + "% self-care " + r.scOwn + "%   groups " + g1 + "/" + g2 + (ok ? "" : "   expected " + p.expect + " and 70/30"));
}
console.log(bad ? "\n" + bad + " preset(s) differ." : "\nAll presets match rhythm.js, and the groups stay 70 and 30.");
process.exit(bad ? 1 : 0);
