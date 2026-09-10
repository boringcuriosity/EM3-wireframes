// Every context key a file uses must be destructured from useWF(). A missing
// one only explodes when that branch renders, so catch it statically instead.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const KEYS = [...readFileSync("src/state.jsx", "utf8")
  .match(/const value = \{([\s\S]*?)\};/)[1]
  .matchAll(/([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.jsx?$/.test(p) && !/state\.jsx$/.test(p)) files.push(p);
  }
})("src");

let bad = 0;
for (const p of files) {
  const src = readFileSync(p, "utf8");
  const blocks = [...src.matchAll(/const \{([^}]*)\} = (?:useWF\(\)|wf)/g)];
  if (!blocks.length) continue;

  // union of every binding in the file; per-scope would be stricter but each
  // file here is essentially one component
  const have = new Set(blocks.flatMap((b) => b[1].split(",").map((s) => s.trim()).filter(Boolean)));

  // drop the destructure blocks, strings and comments before scanning for uses
  let body = src;
  for (const b of blocks) body = body.replace(b[0], "");
  body = body
    // JSX text is prose, not code. Interpolation splits a run of text into
    // segments that no longer start at ">" or end at "<", so each boundary
    // pair has to be swept: ">text<", "}text<", ">text{" and "}text{".
    .replace(/>[^<>{}=;()]+</g, "><")
    // All four exclude "=;()" so they can only ever eat prose. Without that
    // they run from an unrelated ">" or "}" earlier in the file to the first
    // "<" of the return, taking real statements with them: the ">" of an arrow
    // function was enough to hide every use between it and the JSX.
    .replace(/\}[^<>{}=;()]+</g, "}<")
    .replace(/>[^<>{}=;()]+\{/g, ">{")
    .replace(/\}[^<>{}=;()]+\{/g, "}{")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");

  /* And the other direction, which is the one that bites quietly.

     Destructuring a name the provider never puts in the value is not an error
     anywhere: it lands as `undefined`, and a screen that reads it as a boolean
     simply renders the wrong branch for good. `moveStarted` sat outside the
     value object for a while and Move's card showed "Nothing logged yet" over
     a session it was, in the same breath, reporting as done. */
  for (const b of have) {
    // `momentumParts: m` asks the provider for the name on the left and calls
    // it the name on the right, so it is the left one that has to exist.
    const k = b.split(":")[0].trim();
    if (!k || k.startsWith("...") || KEYS.includes(k)) continue;
    console.log(`NOT PROVIDED  ${p}  ->  ${k}`);
    bad++;
  }

  for (const k of KEYS) {
    if (have.has(k)) continue;
    for (const m of body.matchAll(new RegExp(`(?<![\\w$])${k}(?![\\w$])`, "g"))) {
      const prev = body.slice(Math.max(0, m.index - 3), m.index);
      if (/[^.]\.$/.test(prev)) continue;                       // property access, p.plan
      if (/^\s*:/.test(body.slice(m.index + k.length))) continue; // object key, phone:
      console.log(`MISSING  ${p}  ->  ${k}`);
      bad++;
      break;
    }
  }
}
console.log(bad ? `\n${bad} binding problem(s)` : "\nevery context key is bound, both ways");
process.exit(bad ? 1 : 0);
