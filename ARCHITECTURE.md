# Architecture

## Overview

`contentful-merge` is a Node.js CLI, built on [oclif](https://oclif.io/), that lets a user diff two
Contentful environments within a space and replay that diff (a "changeset") against a target environment.
It's split into two independent flows — `create` and `apply` — that share a common engine layer.

```
bin/run  →  oclif  →  src/commands/{create,apply}  →  src/engine/{create-changeset,apply-changeset}
                                                              │
                                                              ▼
                                                     src/engine/client (CDA/CMA)
```

## Command layer (`src/commands/`)

Each subdirectory is an oclif command: declares flags/examples, validates input, and hands off to the
corresponding engine entry point. Commands are the only place user-facing I/O (flags, prompts, exit codes)
is handled.

## Engine layer (`src/engine/`)

### `create-changeset`

Builds a changeset describing the differences between a source and target environment:

1. **Fetch** — content types and entries are fetched in parallel from both environments via the CDA client
   (`src/engine/client`), batched and paginated.
2. **Compute ids** — entry/content-type ids present in one environment but not the other are classified as
   added/deleted.
3. **Detect changes** — for ids present in both, `sys.updatedAt` is compared first as a cheap filter; entries
   that differ are then deep-compared and a JSON patch is generated (`fast-json-patch` /
   `generate-json-patch`) to capture the actual field-level diff.
4. Each step above is a Listr2 task (`tasks/`), run sequentially so later steps can depend on earlier
   results via the shared `CreateChangesetContext`.

Output: a JSON changeset file (`sys` block identifying space/source/target, plus an `items` array of
add/update/delete operations) — see the [data structure section](README.md#data-structure) in the README
for the on-disk schema.

### `apply-changeset`

Consumes a changeset file and replays it against a target environment via the CMA client:

1. **Load** the changeset from disk and **validate** it (locale compatibility, entity limits, metadata
   usage — `src/engine/validations`).
2. **Remove**, then **add**, then **change** entities, in that order, via `actions/` (thin wrappers around
   CMA create/update/publish/delete calls).
3. Before any of the above runs, the changeset itself is checked for a fixed set of **warnings** (stale
   creation date, target space/environment mismatch, applying to `master`) and these are rendered up front,
   ahead of the confirmation prompt — they inform the user rather than aborting the run. Issues that occur
   while actually applying entities are raised as errors, not warnings.

Both flows use the same Listr2-based task/renderer pattern so progress and errors are displayed
consistently in the terminal.

### `client`

A single wrapper (`src/engine/client/index.ts`) around the `contentful` (Delivery API) and
`contentful-management` (Management API) SDKs, adding batching, host configuration, and a consistent
user-agent. This is the only module that talks to Contentful's APIs directly.

### `logger`

Structured log/output handling shared by both flows, used to feed Listr2's renderer and to produce the
human-readable summaries printed at the end of a run.

## Cross-cutting concerns

- **Analytics** (`src/analytics/`): anonymous usage analytics via Segment, disabled with `DISABLE_ANALYTICS`
  (set in all test scripts).
- **Error handling** (`src/engine/errors.ts`, `utils/detect-error-level.ts`): CMA/CDA errors are classified
  and rendered with `utils/render-error-output.ts` so partial failures during `apply` are visible per-entity.

## Testing strategy

- `test/unit` — engine/command logic in isolation, no network calls.
- `test/integration` — exercises real CDA/CMA calls against a live space (requires credentials).
- `test/e2e` — full CLI invocations via `bin/dev`, spanning `create` → `apply`.

## Release

Releases are automated via `semantic-release` on `main` (and a `next` prerelease channel), driven by
Conventional Commit messages — there is no manual version bump.
