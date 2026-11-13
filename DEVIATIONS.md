# Deviations from the pre-registration

Each change to the frozen method, with when and why. Every deviation here was declared before the data it could affect existed.

## D1. Fuzzing phase added to Run 1 (2026-11-12, before any call to Neon's API)

- **Frozen:** `--phases examples`.
- **Problem found in the dry run** (local Prism mock, no calls to Neon): the examples phase only tests operations that carry an explicit example in the spec. 4 of the 68 testable GET operations have one, so 64 would be skipped as "no examples" and the census would not be a census.
- **Change:** `--phases examples,fuzzing`. Everything else stays as frozen: positive mode only (schema-valid requests), `--max-examples 1`, GET only, the same three checks, one request at a time, at most 30 a minute. Path IDs come from the test project (see `harness/schemathesis.toml`), so generated values only fill optional query parameters.
- **Effect on the dry run:** 68 of 68 operations tested instead of 4.
- **Consequence for reporting:** a failure on a generated optional query value is a lead like any other and goes through the confirmation rule. The report says which requests came from spec examples and which were generated.

## Harness notes (not deviations)

- The 75 operations in the frame split into 55 project paths (project-scoped key) and 20 account paths (personal key), run as two passes.
- 7 operations are skipped with a reason fixed in `harness/skips.csv` (1 `feature`, 6 `id`), so 68 are tested.
- The GET-only guard is double: `--include-method GET` plus a `before_call` hook that refuses anything else. In the first dry run, a filter mistake selected non-GET operations; the hook refused all 20 of them before sending, and only GETs reached the mock. The filter is fixed.
- Run results stay out of this repo (`runs/` is git-ignored) until Neon has been told and 14 days have passed.
- Day 2 (2026-11-13): the curl reproductions (`scripts/day2-repro.mjs`) first ran at 12:53 UTC, before the 24-hour mark; reproduction has no time rule. The 24-hour repeat is Run 1 (2026-11-12 16:18 UTC) against the unchanged rerun (2026-11-13 16:21 UTC), and the curl script ran again at 16:22 UTC with the same results.
