# How the research is organized

Agents gather; scripts decide. This file is about the gathering: scoping the
question, finding out whether the data can be had, knowing how bulk sources
lie, and running a fleet without wasting the wall clock. The brief an agent
receives, and the shape it must return, are in `fleet-brief.md`.

## Scope the question before anyone searches

The naive framing is unbounded ("count every assistant coach's rings"). Look
for the small fixed set on the other side of the join: ~40 championship
team-seasons, each with a staff of 10–100. Research those, and compute the
answer with a deterministic join in plain code.

```
small fixed list  ×  researched rows  →  join in code  →  answer
```

Agents never count. A wrong total can then only come from a wrong row, and
every row is auditable on its own.

## Probe before you harvest

A fleet is the expensive move; find out first whether the data exists and
where. The deliverable of this phase is a spec, not data.

- **Measure what you already have.** The existing payload had kickoff hours
  for 89–96% of games from 2002 on, and 2001 was all placeholders. That
  defined the gap before anyone searched (cases: csk-kickoff-probe).
- **Run a scripted sample before any agents.** A stratified probe (232 season
  pages, sampled by era × program tier) produced real coverage numbers in
  minutes. Those numbers go into every agent brief as already ruled in or out.
- **The feasibility fleet maps sources; it does not collect.** Per source:
  span, granularity, script-harvestable vs. needs-a-reader vs. paywalled,
  three verbatim spot checks from different decades, and whether the source
  type generalizes to other entities. Require a "tried, nothing usable — don't
  retry" list.
- **Pick entities as deliberate cases, one of them negative.** The famous
  case, the case with a strong fan archive but no encyclopedia coverage, the
  time-zone case, and the case chosen to learn what exists when the easy
  sources don't (cases: csk-southern-miss). Add one agent for sources that
  aren't entity-specific.
- **Trace what an aggregator cites.** Encyclopedia kickoff times cited
  newspaper clippings behind a paywall; a stats API matched the hobbyist
  source on 952 of 980 games because it descends from it (cases:
  csk-cfbd-howell-lineage). Two agreeing sources can be one source twice.
- **Find floors empirically.** Probe the API across years instead of trusting
  its docs: player stats returned nothing before 2004; roster positions were
  0% filled in 2004 and complete by 2012.
- **Check terms before scaling onto a source.** A newspaper archive's terms
  barred bulk and AI access; the options (human-pace lookups on a triage
  list, a permission email, library databases) are the user's call to make
  knowingly (cases: csk-newspapers-tos).

## Bulk sources lie in characteristic ways

The audit a bulk source needs before it is trusted (cases:
csk-placeholder-times for all of these):

- **Placeholders that look real.** Midnight timestamps; a `timeValid: false`
  flag; a constant value across every early row (midnight UTC rendered in a
  local zone); one season exactly an hour off.
- **Symbols that mean something else.** "(N)" was neutral site, not night,
  in three media guides. OCR mangles marker characters; prefer the
  born-digital edition.
- **Planned vs. actual.** A preseason schedule is not a box score. Odd minutes
  (6:08, 7:05) point to actual events.
- **Sources revise themselves.** Markers reconstructed decades later changed
  between editions. Diff editions to find the shaky rows.
- **Curated lists are incomplete.** A school's own "night games" list was
  missing two games the student paper confirmed.
- **Use the source's own quality signals.** Verification colors measured by
  era (92% verified for 1936–77, 75% before) set the window start (cases:
  csk-howell-colors).

## Running the fleet

- **Give agents what you already have.** Otherwise they report your data back
  as a discovery (cases: rings-dedupe-69-60). Truncating the list is worse
  than omitting it (cases: rings-truncated-list).
- **Batch by beat, not alphabetically.** Agents that hunt one entity's history
  build reusable context; agents given a random slice re-learn every time.
  Group fetches by the concentrated side of the join (cases:
  ht-host-season-pages).
- **Every agent namespaces its scratch files** under its own subdirectory.
  Siblings sharing a scratchpad will overwrite each other's helpers (cases:
  ht-scratchpad-overwrite).
- **Agents save every page they quote and ship a re-runnable checker**, into
  the repo, not the scratchpad (cases: csk-scratchpad-pages-died).
- **Wall clock, not dollars, is the constraint.** Full-assembly and
  verification sweeps ran 20–50 minutes across 13–22 agents; patch-layer and
  feasibility fleets ran 3–6 agents for 20–25 minutes. Bake large inputs into
  the workflow script rather than the tool call when the payload is tens of
  KB. Fix the merge scripts, not the research; re-running a merge is free.

## Assets for a cast of hundreds

If the page shows entities, it needs their marks or faces, and a gray box
beside a famous name reads as broken.

- **The visible set is the union of every filter's top N**, not the overall
  top N (cases: rings-visible-set).
- **Free pass first, agents second.** A Wikipedia/Commons pass with a license
  check costs nothing and covers the famous (cases: rings-portraits-28-66).
  Hand agents only the remainder, pointed at the sources that work:
  institutional directories, the Wayback CDX index for departed staff,
  hall-of-fame pages, obituaries.
- **Verify in-loop.** `curl -sIL <url>` and confirm a 200 with an `image/*`
  type before returning it. A wrong face is worse than no face.
- Keep a manifest with source, license, and caveat per asset, a `locked` flag
  so a hand-picked one survives every re-run, and a build check that the
  payload names no entity whose assets are not committed (cases:
  csk-opponent-logos-gate). List what has no fix from the source (an id with
  no image) rather than degrading silently.
