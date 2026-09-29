import test from "node:test";
import assert from "node:assert/strict";
import { merge } from "../bin/merge.mjs";

test("objects merge deeply, scalars replace", () => {
  assert.deepEqual(merge({ a: { b: 1, c: 2 } }, { a: { c: 3 }, d: 4 }), { a: { b: 1, c: 3 }, d: 4 });
});
test("arrays concatenate without duplicates", () => {
  assert.deepEqual(merge({ x: [1, 2] }, { x: [2, 3] }), { x: [1, 2, 3] });
});
