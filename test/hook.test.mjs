import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const hook = fileURLToPath(new URL("../hooks/catapult-event", import.meta.url));
const input = JSON.stringify({ session_id: "s1", cwd: "/w", transcript_path: "/t.jsonl", extra: 1 });
const env = (url) => ({ PATH: process.env.PATH, HOME: "/nonexistent", ...(url ? { CATAPULT_INGEST_URL: url } : {}) });

test("posts normalized event", async () => {
  let got;
  const srv = createServer((req, res) => {
    let b = ""; req.on("data", (d) => (b += d)); req.on("end", () => { got = JSON.parse(b); res.end("ok"); });
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${srv.address().port}/ingest`;
  await new Promise((resolve) => {
    const c = spawn(hook, ["Stop"], { env: env(url) });
    c.on("close", resolve);
    c.stdin.end(input);
  });
  srv.close();
  assert.equal(got.harness, "claude");
  assert.equal(got.event, "Stop");
  assert.equal(got.session_id, "s1");
  assert.equal(got.transcript_path, "/t.jsonl");
  assert.equal(got.payload.extra, 1);
});

test("fails open and fast when nothing is listening", () => {
  const t = Date.now();
  const r = spawnSync(hook, ["Stop"], { env: env("http://127.0.0.1:9/ingest"), input });
  assert.equal(r.status, 0);
  assert.ok(Date.now() - t < 1000);
});

test("no-op when unset", () => {
  const r = spawnSync(hook, ["Stop"], { env: env(), input });
  assert.equal(r.status, 0);
});
