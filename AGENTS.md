# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this project is

`contentful-merge` is an oclif-based CLI (`contentful-merge`) that diffs and merges Contentful entries
across two environments in the same space. It has two commands:

- `create` (`src/commands/create`) — compares a source and target environment, producing a changeset
  JSON file describing adds/updates/deletes.
- `apply` (`src/commands/apply`) — takes a changeset file and applies it against a target environment.

## Where things live

- `src/commands/` — oclif command definitions (flags, examples, wiring into the engine).
- `src/engine/create-changeset/` — logic for diffing two environments into a changeset (`tasks/` holds the
  individual Listr2 steps: fetch content types/entries, compute ids, detect changed/added entities).
- `src/engine/apply-changeset/` — logic for applying a changeset (`tasks/` load/validate the changeset, then
  remove/add/change entities; `actions/` are the low-level CMA calls; `warnings/` collect non-fatal issues).
- `src/engine/client/` — thin wrapper around the Contentful Delivery (CDA) and Management (CMA) SDKs used by
  both flows.
- `src/engine/validations/` — pre-flight checks (locale mismatches, entity count limits, metadata usage).
- `src/engine/logger/` — structured logging/output rendering used by the Listr2 task runner.
- `src/analytics/` — Segment analytics wrapper; respects `DISABLE_ANALYTICS`.
- `test/unit`, `test/integration`, `test/e2e` — see Testing below.

## Build, lint, and test

```bash
npm install
npm run build          # tsc build to dist/
npm run check-types    # tsc, no emit
npm run lint           # eslint src
npm run test-unit      # mocha, no external calls
npm run test-integration  # requires CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN + CONTENTFUL_SPACE_ID
npm run test-e2e
npm test               # unit + integration + e2e
```

Run `npm run test-unit` after any engine or command change — it's the fast, dependency-free check. Only run
integration/e2e tests if you have valid Contentful credentials in your environment; they hit real APIs.

## Conventions

- TypeScript, `strict: true`. Keep new code typed; avoid `any` unless mirroring an existing SDK type.
- Task-based flows use [listr2](https://listr2.kilic.dev/); new steps in `create-changeset`/`apply-changeset`
  should follow the existing `createXTask()` factory pattern in their respective `tasks/` folder.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`commitlint` + `semantic-release`
  drive versioning off commit messages — do not hand-edit `package.json` version).
- Formatting is enforced via Prettier + ESLint through `lint-staged`/husky pre-commit hooks; run
  `npm run lint-fix` / `npm run prettier-fix` before committing if hooks flag issues.

## Things to avoid

- Don't add new dependencies without checking they're compatible with the `node >=24 <25` engine constraint.
- Don't remove or bypass the `apply` confirmation prompt — it exists to prevent accidental destructive
  changes to a target environment. `--yes` is the explicit, user-supplied way to skip it; don't skip it any
  other way.
- Don't commit generated files (`dist/`, `oclif.manifest.json`, `npm-shrinkwrap.json`) — they're build/release
  artifacts.
