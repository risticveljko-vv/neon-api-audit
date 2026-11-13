// Day 2: reproduce each Run 1 lead with a plain curl request (confirmation rule, step 1).
//
// Usage:  node --env-file=.env scripts/day2-repro.mjs          # sends 7 GET requests to Neon
//         node scripts/day2-repro.mjs --dry                     # prints the curl lines, sends nothing
//
// GET only, one request at a time, under 30 a minute. The key reaches curl on stdin (-H @-), so it never
// appears in argv, in the shell history or in a saved file. Each case saves <id>.body.json and
// <id>.headers.txt (response headers only) to runs/day2-<UTC stamp>/, plus repro.json with the status and
// the curl line, key shown as $NEON_PROJECT_KEY or $NEON_PERSONAL_KEY. runs/ is git-ignored.
//
// The IDs below are the audit's own test project, branch and organization (the same as harness/run.mjs).
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const LIVE = "https://console.neon.tech/api/v2";
const P = "withered-mouse-88755965", B = "br-old-forest-bdzbba7e", O = "org-weathered-mountain-47083441";
const dry = process.argv.includes("--dry");
const day = d => d.toISOString().slice(0, 10) + "T00:00:00Z";
const to = day(new Date()), from = day(new Date(Date.now() - 7 * 864e5));
const hist = `from=${from}&to=${to}&granularity=daily`;

const cases = [
  // id, why, key, path
  ["E4-1a", "lead: personal key, org_id omitted (spec: optional)", "PERSONAL", `/consumption_history/projects?${hist}`],
  ["E4-1b", "control: same call with org_id", "PERSONAL", `/consumption_history/projects?${hist}&org_id=${O}`],
  ["members", "Run 1 key-type error: retry with the personal key", "PERSONAL", `/projects/${P}/members`],
  ["schema-a", "Run 1 500: db_name only, seeded value", "PROJECT", `/projects/${P}/branches/${B}/schema?db_name=neondb`],
  ["schema-b", "control: db_name missing (spec: required)", "PROJECT", `/projects/${P}/branches/${B}/schema`],
  ["projects", "Run 1 state error: real org_id instead of the spec example", "PERSONAL", `/projects?org_id=${O}`],
  ["count", "Run 1 state error: org_id given", "PERSONAL", `/projects/count?org_id=${O}`],
];

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const out = `runs/day2-${stamp}`;
if (!dry) mkdirSync(out, { recursive: true });
const rows = [];
for (const [id, why, which, path] of cases) {
  const shown = `curl -sS -H "Authorization: Bearer $NEON_${which}_KEY" -H "Accept: application/json" "${LIVE}${path}"`;
  if (dry) { console.log(`${id}: ${shown}`); continue; }
  const key = process.env[`NEON_${which}_KEY`];
  if (!key) throw new Error(`NEON_${which}_KEY missing from .env`);
  await sleep(2100); // under 30 a minute
  const r = spawnSync("curl", ["-sS", "-H", "@-", "-H", "Accept: application/json", "-o", `${out}/${id}.body.json`,
    "-w", "%{http_code}", "-D", `${out}/${id}.headers.txt`, LIVE + path], { input: `Authorization: Bearer ${key}\n`, encoding: "utf8" });
  const status = r.stdout.trim();
  rows.push({ id, why, status, curl: shown, at: new Date().toISOString() });
  console.log(`${id}  HTTP ${status}  ${why}`);
}
if (!dry) writeFileSync(`${out}/repro.json`, JSON.stringify(rows, null, 2) + "\n");
