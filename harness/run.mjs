// Usage: node --env-file=.env harness/run.mjs mock|live
// Runs Schemathesis in two passes (project key, personal key), GET only, one request at a time.
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const mode = process.argv[2];
if (!["mock", "live"].includes(mode)) { console.error("mode: mock|live"); process.exit(2); }
const LIVE = "https://console.neon.tech/api/v2";
const MOCK = "http://127.0.0.1:4010";
const base = mode === "live" ? LIVE : MOCK;
const P = "withered-mouse-88755965", B = "br-old-forest-bdzbba7e", O = "org-weathered-mountain-47083441";
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = `runs/${mode}-${stamp}`;
mkdirSync(outDir, { recursive: true });

const skips = readFileSync("harness/skips.csv", "utf8").trim().split("\n").slice(1).map(l => l.split(",")[0]);

async function seed() {
  if (mode === "mock") return { AUDIT_DATABASE_NAME: "neondb", AUDIT_ROLE_NAME: "neondb_owner", AUDIT_ENDPOINT_ID: "ep-mock", AUDIT_OPERATION_ID: "00000000-0000-0000-0000-000000000000", AUDIT_MEMBER_ID: "00000000-0000-0000-0000-000000000000" };
  const get = async (path, key) => {
    await sleep(2100); // stays under 30 a minute
    const r = await fetch(LIVE + path, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
    if (!r.ok) throw new Error(`seed ${path}: HTTP ${r.status}`);
    return r.json();
  };
  const pk = process.env.NEON_PROJECT_KEY, ak = process.env.NEON_PERSONAL_KEY;
  const eps = await get(`/projects/${P}/branches/${B}/endpoints`, pk);
  const dbs = await get(`/projects/${P}/branches/${B}/databases`, pk);
  const roles = await get(`/projects/${P}/branches/${B}/roles`, pk);
  const ops = await get(`/projects/${P}/operations`, pk);
  const mem = await get(`/organizations/${O}/members`, ak);
  const ids = {
    AUDIT_ENDPOINT_ID: eps.endpoints?.[0]?.id, AUDIT_DATABASE_NAME: dbs.databases?.[0]?.name,
    AUDIT_ROLE_NAME: roles.roles?.find(r => !r.protected)?.name ?? roles.roles?.[0]?.name,
    AUDIT_OPERATION_ID: ops.operations?.[0]?.id, AUDIT_MEMBER_ID: mem.members?.[0]?.id,
  };
  for (const [k, v] of Object.entries(ids)) if (!v) throw new Error(`seed: no value for ${k}`);
  return ids;
}

async function waitForMock() {
  for (let i = 0; i < 60; i++) { try { await fetch(MOCK + "/regions"); return; } catch { await sleep(500); } }
  throw new Error("mock did not start");
}

let mock;
try {
  if (mode === "mock") {
    mock = spawn("node_modules/.bin/prism", ["mock", "spec/v2.json", "--port", "4010", "--errors"], { stdio: "ignore" });
    await waitForMock();
  }
  const ids = await seed();
  writeFileSync(`${outDir}/seed.json`, JSON.stringify(ids, null, 2) + "\n");
  const passes = [
    { name: "project", key: mode === "live" ? process.env.NEON_PROJECT_KEY : "mock", filter: ["--exclude-path-regex", "^/(?!projects/\\{project_id\\})"] },
    { name: "account", key: mode === "live" ? process.env.NEON_PERSONAL_KEY : "mock", filter: ["--exclude-path-regex", "^/projects/\\{project_id\\}"] },
  ];
  const results = {};
  for (const p of passes) {
    const args = ["--from", "schemathesis==4.32.7", "st", "--config-file", "harness/schemathesis.toml", "run", "spec/v2.json",
      "--url", base, "--include-method", "GET", "--exclude-deprecated", "--mode", "positive", "--phases", "examples,fuzzing",
      "--checks", "status_code_conformance,content_type_conformance,response_schema_conformance", "--max-examples", "1",
      ...p.filter, ...skips.flatMap(id => ["--exclude-operation-id", id]),
      "--report", "junit,har", "--report-dir", `${outDir}/${p.name}`];
    console.log(`\n=== ${mode} / ${p.name} pass ===`);
    const r = spawnSync("uvx", args, { stdio: "inherit", env: { ...process.env, ...ids, AUDIT_KEY: p.key } });
    results[p.name] = r.status;
  }
  writeFileSync(`${outDir}/exit-codes.json`, JSON.stringify(results) + "\n");
  console.log(`\nReports in ${outDir}. Exit codes: ${JSON.stringify(results)}`);
} finally {
  if (mock) mock.kill();
}
