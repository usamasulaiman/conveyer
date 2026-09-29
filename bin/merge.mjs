#!/usr/bin/env node
// Deep-merge JSON files (later wins). Objects merge, arrays concatenate with de-dup, scalars replace.
//   merge.mjs base.json overlay.json [...]   → stdout
import { readFileSync } from "node:fs";

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export function merge(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const seen = new Set();
    return [...a, ...b].filter((x) => {
      const k = JSON.stringify(x);
      return seen.has(k) ? false : (seen.add(k), true);
    });
  }
  if (isObj(a) && isObj(b)) {
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) out[k] = k in a ? merge(a[k], v) : v;
    return out;
  }
  return b;
}

if (import.meta.filename === process.argv[1]) {
  const files = process.argv.slice(2);
  const result = files.map((f) => JSON.parse(readFileSync(f, "utf8"))).reduce(merge, {});
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}
