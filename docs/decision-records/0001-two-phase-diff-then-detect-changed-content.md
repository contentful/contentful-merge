# 1. Detect changed entities via `sys.changedAt` before diffing payloads

Date: 2026-08-25

## Status

Accepted

## Context

`contentful-merge create` needs to determine which entries/content types differ between a source and
target environment. A space can contain a large number of entries, and computing a full field-level diff
(JSON patch) for every entry that exists in both environments would mean fetching and deep-comparing the
full payload of every shared entity on every run, even when the vast majority haven't changed.

## Decision

Change detection happens in two steps (`src/engine/create-changeset`):

1. Fetch a partial representation of every content type/entry from both environments and compare
   `sys.changedAt`. Entities whose timestamp differs are marked as *potentially* diverged.
2. Only for that (typically much smaller) subset, fetch the full payload from both environments, strip
   `sys` metadata, and generate an actual JSON patch (`fast-json-patch` / `generate-json-patch`). Entities
   whose payload turns out to be identical despite a changed timestamp are dropped from the changeset.

## Consequences

- Avoids full-payload fetching/diffing for entities that haven't changed, which is the common case for a
  large space with a small, targeted diff.
- Adds a second network round-trip for entities that *did* change, since their full payload is fetched only
  after the timestamp check.
- Relies on `sys.changedAt` being a reliable signal of "might have changed"; it is expected to be a superset
  of actually-changed entities (false positives are handled correctly by the payload diff), never a subset.
