// Reports pi lifecycle events to catapult. Fail open: errors are swallowed.
// Endpoint: $CATAPULT_INGEST_URL, else ~/.config/conveyer/env. Unset → no-op.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function endpoint(): string | undefined {
  if (process.env.CATAPULT_INGEST_URL) return process.env.CATAPULT_INGEST_URL;
  try {
    const env = readFileSync(join(homedir(), ".config/conveyer/env"), "utf8");
    return env.match(/^(?:export\s+)?CATAPULT_INGEST_URL=["']?([^"'\n]+)/m)?.[1];
  } catch {
    return undefined;
  }
}

export default function (pi: ExtensionAPI) {
  const url = endpoint();
  if (!url) return;

  const send = (event: string, ctx: any, payload: unknown = {}) => {
    const sessionFile: string | undefined = ctx?.sessionManager?.getSessionFile?.();
    const body = {
      harness: "pi",
      event,
      session_id: ctx?.sessionManager?.getSessionId?.(),
      cwd: ctx?.cwd ?? process.cwd(),
      transcript_path: sessionFile,
      ts: new Date().toISOString(),
      payload,
    };
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300),
    }).catch(() => {});
  };

  pi.on("session_start", (_e: any, ctx: any) => send("SessionStart", ctx));
  pi.on("agent_start", (_e: any, ctx: any) => send("UserPromptSubmit", ctx));
  pi.on("agent_settled", (_e: any, ctx: any) => send("Stop", ctx));
  pi.on("session_shutdown", (_e: any, ctx: any) => send("SessionEnd", ctx));
}
