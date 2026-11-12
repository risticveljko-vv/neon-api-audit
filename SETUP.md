# Setup log

Everything here was done by hand in the Neon Console, not by the harness. Times are UTC.

| When | What | Value |
| --- | --- | --- |
| 2026-11-12 15:46 | Spec re-checked before the freeze | SHA-256 unchanged (`64a2beee…2827`); server `last-modified` moved to Thu, 12 Nov 2026 15:02:01 GMT with identical content |
| 2026-11-12 15:46 | Account | new free Neon account, signed up with GitHub |
| 2026-11-12 15:46 | Organization | `org-weathered-mountain-47083441`, name `neon-api-audit`, "Personal projects" |
| 2026-11-12 15:46 | Project | `audit-test`, id `withered-mouse-88755965`, AWS US East 2 (Ohio), Postgres only (object storage, functions, AI gateway, realtime and Better Auth off) |
| 2026-11-12 15:46 | Branch, database, role, compute | the defaults created with the project; default branch `production` (`br-old-forest-bdzbba7e`). The database, role and endpoint names get read from the API in Run 1 and recorded there |
| 2026-11-12 15:56 | Project-scoped key | name `audit-project`, scoped to `audit-test`; Veljko created it and put it in `.env` (git-ignored). Value never shown to Claude |
| 2026-11-12 15:56 | Personal key | name `audit-personal`, same account; in `.env` the same way |

Note: the welcome screen offers an "agent prompt" (install the Neon CLI, `neon init`, `neon deploy`) for wiring an app. Not used: this audit only calls the API.
