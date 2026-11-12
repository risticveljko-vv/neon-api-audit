# Run sheet: day 1 (Thu 2026-11-12)

Every step runs in the foreground, and nothing is scheduled or left running (Veljko, for this test). ⟦V⟧ = Veljko does it. ⟦C⟧ = Claude does it.

## 0. Decisions first (⟦V⟧, about 5 min)

1. **Where the pre-registration is frozen.** It has to be public before Run 0 for the timestamp to mean anything. Options:
   - A. Make this repo public on risticveljko-vv (recommended; the repo is the "receipts" link in the reveal).
   - B. A public gist holding only PREREGISTRATION.md and frame.csv, with the repo private until the reveal.
2. Repo name: `neon-api-audit`, or something else.
3. Two keys (a project-scoped key for `audit-test` and a personal key for the 20 account-level paths), or only the project-scoped key, with the 20 paths skipped as `auth`.

## 1. Account (⟦C⟧ fills, ⟦V⟧ submits)

- Sign up for Neon's free plan, no card, in the signed-in browser profile.
- Create the project `audit-test` with the default branch, database, role and compute. Write each one down in SETUP.md.
- Create the key or keys. ⟦V⟧ pastes them into `.env` as `NEON_PROJECT_KEY=`, and `NEON_PERSONAL_KEY=` if chosen. Claude checks that the variable names exist, never the values.

## 2. Freeze (⟦C⟧, then ⟦V⟧ pushes)

- Re-download the spec. If the SHA differs from the pre-registration, take the new file, update the SHA and the counts, and note the change.
- Fill in `[SHA]` and the date, commit, and push or publish per decision 1. **No checks run before this push.**

## 3. Run 0: static (⟦C⟧, about 1 h, no calls to Neon)

- `npm run static:spectral` and `npm run static:redocly`, then triage the E5 leads.
- E7: compare the hand-written guides in neondatabase/website `content/docs` against the frozen spec (a local clone, read only).

## 4. Dry run (⟦C⟧, no calls to Neon)

- `npm run mock` in the foreground; Schemathesis against `http://127.0.0.1:4010`. It checks the GET-only guard, the ID seeding and the report output.
- Stop the mock when this step is done.

## 5. Run 1: live (⟦C⟧ runs it while ⟦V⟧ watches, about 1 to 2 h)

- 30 a minute at most, one request at a time. Every skip gets a reason.
- Save HAR and JUnit to `runs/`, with tokens stripped. Raw responses go to `runs/raw/`, which git ignores.

## Day 2 (≥24 h later)

- Reproduce every lead with curl. A second reader checks each one. Then ⟦V⟧ reads the findings.
- Filing goes through Neon's feedback channel, one issue per report, and only on Veljko's go.
- Earliest post: 14 days after filing, on a Friday. If filing happens on 13 or 16 Nov, that's Fri 4 Dec.
