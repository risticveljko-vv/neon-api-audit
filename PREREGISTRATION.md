# Pre-registration: Neon API, docs versus behaviour

Status: **FROZEN on 2026-11-12.** The freeze time is the timestamp of the first public commit, made before any check ran (Run 0 included). No result existed at that point. Any later change to this file is a deviation and gets logged in the report with its reason.

## Question

What share of Neon's read endpoints have at least one confirmed disagreement between the published API spec and what the API returns?

## Target, frozen

| Item | Value |
| --- | --- |
| Spec | `https://neon.com/api_spec/release/v2.json`, linked from the [API reference](https://neon.com/docs/reference/api-reference) |
| Fetched | 2026-11-11 21:09 UTC; server `last-modified` Tue, 10 Nov 2026 21:00:57 GMT |
| SHA-256 | `64a2beee00eb38d9fddc61c5ce38552f08ec6655741393924574cebefc322827` |
| Copy | Not redistributed here: the spec's licence field says "Proprietary". `npm run fetch-spec` downloads it into `spec/v2.json` and checks the SHA. Independent archived copy: [Internet Archive, 2026-11-12 15:55 UTC](https://web.archive.org/web/20261112155523/https://neon.com/api_spec/release/v2.json) (same SHA once decompressed). |
| Re-checked | 2026-11-12 15:46 UTC, before the freeze: same SHA; the server's `last-modified` had moved to Thu, 12 Nov 2026 15:02:01 GMT with identical content |
| Operations | 194 in total, 79 GET |
| Base URL | `https://console.neon.tech/api/v2` |

If Neon changes the spec during the run, the frozen file still counts. Any change goes in the report as a note, made with oasdiff.

## Frame: a census, no sampling

- All 79 GET operations are in `frame.csv`.
- **4 are deprecated** (Neon Auth paths). They're excluded and listed.
- **75 are in the frame.** Each one is either tested or skipped with a logged reason. The skip reasons are fixed in advance:
  - `plan`: the operation needs a paid plan.
  - `feature`: it needs a feature the free account can't create, such as VPC endpoints or invitations.
  - `id`: no object exists to pass in as a path ID, and creating one is outside the setup below.
  - `auth`: no key of the types below can call it.
- The headline denominator is the tested count. It's reported as "testable on a free account".

## Accounts and keys

- One new free Neon account with nothing else in it, and one test project called `audit-test`.
- **Neon has no read-only API key.** [Its docs](https://neon.com/docs/manage/api-keys) say project-scoped keys have Editor access to one project, and personal keys reach every project in the account. Containment comes from two things:
  - The 55 project paths use a **project-scoped key** for `audit-test` only.
  - The 20 account-level paths (`/users/me`, `/organizations/…`, `/consumption_history/…`, `/projects`, `/regions`, `/api_keys`, `/auth`) use a **personal key** on the same empty account.
- The harness refuses any method other than GET before a request is sent.
- Keys live in `.env`, which git ignores, and load with `node --env-file`. They're never printed or logged, and they're stripped from every saved request.
- **Setup is done by hand in the Neon Console, not by the harness:** a project, a branch, a database, a role and an endpoint. Each one is recorded in `SETUP.md` with a timestamp.

## What counts as an error

| Code | Category | Counts when |
| --- | --- | --- |
| E1 | Wrong status code | A valid request returns a status that the spec doesn't list for that operation, and it happens on two runs. |
| E2 | Missing field | A field that the schema marks required is absent. |
| E3 | Wrong type | A value breaks the documented type, enum, format or nullability. |
| E4 | Undocumented required parameter | A request that's valid per the spec is rejected, and an undocumented input fixes it. |
| E5 | Stale example | A documented example fails its own schema (Run 0), or fails when it's sent as written. |
| E6 | Wrong content type | The response media type differs from the documented one. |
| E7 | Dead reference | A hand-written guide in Neon's docs cites an endpoint or parameter that isn't in the frozen spec. |

**Not counted, logged separately:** undocumented extra fields (unless the schema forbids them), undocumented headers, missing descriptions or examples, lint and style issues, 5xx, 429, timeouts, and 403 or 404 caused by plan or permission limits.

**Severity:** S1 breaks a client, S2 misleads, S3 is cosmetic. The headline counts all confirmed errors, and the S1 count is reported beside it.

## Confirmation rule

A tool failure is a lead, not a finding. A lead counts only when:

1. it's reproduced with a plain request (curl, token removed in the saved copy);
2. it's repeated at least 24 hours later with the same result;
3. a second reader checks it against the frozen spec.

Anything that's unconfirmed stays out of the count and is listed as unconfirmed.

## Runs

- **Run 0, static. No calls to Neon.** Spectral (`oas3-valid-media-example`, `oas3-valid-schema-example`) and Redocly as a second opinion. Measures E5 on the examples. The headline claim from Run 0 is "examples that fail their own schema", never "docs that disagree with the API".
- **Dry run against a local Prism mock.** Sends nothing to Neon. Confirms the harness, the ID seeding and the GET-only guard.
- **Run 1, live, GET only.** Schemathesis 4.32.7 restricted to: `--include-method GET --exclude-deprecated --mode positive --phases examples --checks status_code_conformance,content_type_conformance,response_schema_conformance --max-examples 1`.
  - One request at a time, at most 30 a minute. Neon allows 700 a minute; this stays far below it.
  - Back off on any 429 or `Retry-After`.
  - Expected total: about 150 requests, including reproductions.
- **Second pass at least 24 hours later**, for the confirmation rule.

## Reporting

- **Metric:** endpoints with ≥1 confirmed error ÷ endpoints tested, with a Wilson 95% interval. The tested count and the skip count by reason are reported with it.
- **Before posting, Neon is told through its own channel.** The [feedback page](https://neon.com/docs/introduction/feedback) and `neon feedback` ask for one issue per report. Wait 14 days after filing before any post that cites a finding.
- Anything that looks like a security flaw is handled privately, left out of every post, and gets 90 days.
- **Wording:** "at spec SHA X on date Y", never "their docs are bad". First person, present run only.
- The spec's licence field says "Proprietary", so it's quoted sparingly: operation IDs and short excerpts only.

## Poll (fixed before any result)

> Guess: I called every read endpoint in Neon's API and compared each answer with Neon's own spec. What share disagreed?

Options: Under 5% / 5% to 15% / 15% to 40% / Over 40%

## What this is not

- It's not a ranking against other APIs.
- It's not a security test.
- It's not a write test: no POST, PUT, PATCH or DELETE comes from the harness.
- It's not a judgment on Neon's docs as a whole. It measures one spec, on one date, from one free account.
