# neon-api-audit

Does Neon's API do what its spec says? Every read endpoint, one free account, no writes.

- Method and rules, fixed before any result: [PREREGISTRATION.md](PREREGISTRATION.md)
- Endpoint frame (all 79 GETs): [frame.csv](frame.csv)
- Frozen spec: not redistributed (licence: Proprietary). `npm run fetch-spec` downloads it and checks the SHA-256; an [archived copy](https://web.archive.org/web/20261112155523/https://neon.com/api_spec/release/v2.json) is on the Internet Archive
- Setup log (account, project, keys; no secrets): [SETUP.md](SETUP.md)
- Deviations from the pre-registration, declared before the data: [DEVIATIONS.md](DEVIATIONS.md)
- Harness (Schemathesis config, GET-only guard, skips, runner): [harness/](harness/); `npm run dry-run` (local mock), `npm run run:live`
- Run sheet: [RUNSHEET.md](RUNSHEET.md)

Status: pre-registration frozen 2026-11-12 with this repo's first public commit. Nothing had run against Neon at that point. Results come after Neon has been told and 14 days have passed (see the pre-registration).

Tools (pinned): Spectral 6.17.0, Redocly CLI 2.72.0, Prism 5.16.0 (`npm install`), and Schemathesis 4.32.7 (`uvx --from schemathesis==4.32.7 st`). Every step runs in the foreground. Nothing is scheduled or left running.
