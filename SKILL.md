---
name: receipts-research
description: Assemble or verify datasets where every displayed claim must survive an audit — data that "does not exist anywhere" and has to be researched from documents by an agent fleet, or bulk data whose displayed rows must be verified against an independent source. Covers inverting the question so code does the counting, per-row verbatim receipts as a hallucination gate, judgment as versioned rule files, corrections as a layer, coverage reports, fleet prompting that rejects as well as confirms, and portrait sourcing. Use when the user says the data "does not exist anywhere", asks for per-row citations or receipts, wants a computed dataset verified row-by-row, or mentions the how-many-rings / hostile-territory pattern.
---

# Datasets you have to research, not download

Read this when a dataset's answer lives scattered across media guides, staff
directories, archived pages, district websites, and news stories, and an agent
fleet has to assemble it — or when a dataset was computed from bulk files and
every displayed row needs verification against a source the pipeline never
touched. If the data exists as a file or an API, this skill doesn't apply:
fetch it directly (the site-craft skill's build-time-data reference covers
that pattern).

Worked example: `how-many-rings` (championship rings per college football
staffer, 1990–present). No such dataset existed. ~1,300 people were assembled
from 40 championship staffs, each row carrying the source line that proves it.

## Invert the question first

The naive framing is unbounded ("count every assistant coach's rings"). Look for
the small fixed set on the other side of the join: there are only ~40 championship
team-seasons, each with a staff of 10–100. Research those, then compute the answer
with a deterministic join in plain code.

```
small fixed list (champions)  ×  researched rosters  →  join in code  →  answer
```

**The model never counts anything.** Agents extract rows; code does the join, the
counting, and the ranking. A wrong total can then only come from a wrong row, and
every row is auditable on its own.

## Every row carries its own receipt

Make each extracted row include the **verbatim quote** from the source that
supports it, alongside the URL. This is worth the extra tokens for three reasons:

1. It is mechanically checkable — string-match the quote against the fetched page
   and reject rows that fail. A hallucinated row cannot survive.
2. It becomes the UI. Each claim links out with its quote in the `title`.
3. It makes agents concrete. "Return the exact line" produces better extraction
   than "tell me who was on staff."

Grade the evidence, and show the grade. how-many-rings separates rows sourced from
a staff list (`roster`) from rows inferred from a documented employment span
(`tenure`), and labels the weaker kind in the UI. Mixing evidence grades silently
is the fastest way to lose the reader's trust when one claim turns out soft.

## Agents are for gathering; scripts are for deciding

Every judgment that can be a rule should be a rule in a versioned file, not a
per-agent decision:

- `data/employment-rules.json` — who counts as staff (patterns + the reason shown
  in the UI). One rule change re-scores the whole dataset consistently.
- `data/name-aliases.json` — the same person spelled differently across sources.
- Merge scripts that dedupe against what's already there, drop low-confidence
  rows, and print what they skipped and why.

Agents re-report things you already have. Every merge script needs a dedupe pass:
in how-many-rings one audit "found" 69 missing people, of whom 60 were already in
the data.

## Ship a coverage report, not a vibe

The failure modes of a researched dataset are invisible in the finished product —
the page looks equally confident whether it is complete or missing a third of its
rows. Write a `scripts/coverage-report.mjs` that measures the things you cannot
see, and run it after every merge. The checks that earned their place:

| Check | What it catches |
|---|---|
| **Depth asymmetry** — overlap between two entities that should share members | One source was richer than another, so an artifact of harvesting reads as a real difference. Two championship staffs two years apart share ~75% of people; when the number was 33%, the thin season was the bug. |
| **Partial membership** — credited for some of a group's events, in a role implying they were there for all | The undercount that contiguous data hides. A photographer credited for 2017 and 2020 looks fine until you learn he started in 1986. |
| **Name-variant splits** — same surname, nickname-compatible first names, same entity | One person silently becoming two, each below your display cutoff. Detect across *all* rows, not just the ones that made the cut. |
| **Image aspect ratio** | A school bio page whose photo is missing serves its site logo as `og:image`. It downloads fine and passes a content-type check; the only tell is that it is landscape. |

Each check should print the suspects, not just a count — the point is to hand a
human (or the next agent fleet) a work list.

## Prompting the fleet

- **Give agents what you already have.** Otherwise they report your existing data
  back as a discovery. Truncating that list is worse than omitting it: three
  agents independently declared people "missing" who were in the tail that got cut.
- **Ask for rejections too**, and make them cheap to report. A sweep that returns
  226 confirmations and 309 rejections is trustworthy; one that only confirms is
  a yes-machine. Rejection counts are the best available proxy for skepticism.
- **Name the failure mode you expect.** "We suspect our thinner season was
  harvested from a worse source, not that everyone left" produces better work than
  "check these names."
- **Demand verification in-loop.** For images: `curl -sIL <url>` and confirm a
  200 with an `image/*` content type before returning it. For people: "a wrong
  face is worse than no face — return null and say what you tried."
- **Batch by beat, not alphabetically.** Agents that hunt "Alabama support staff
  1990s" build reusable context; agents given a random slice re-learn every time.

## Cost shape

Wall clock, not dollars, is the binding constraint — sweeps here ran 20–50 minutes
across 13–22 agents. Two habits pay for themselves:

- **Bake large inputs into the workflow script** rather than routing them through
  the tool call, when the payload is tens of KB.
- **Fix the merge scripts, not the research.** Re-running a merge is free;
  re-running a fleet is not. Journals persist — reprocess them.

## Portraits for a cast of hundreds

If the page shows people, it needs faces, and a gray box beside a famous name
reads as broken. Two things worth knowing:

- **The visible set is the union of every filter's top N**, not the overall top N.
  A well-known name can sit at rank 297 overall and rank 87 inside one filter.
- **Free pass first, agents second.** A Wikipedia/Commons pass with a license
  check costs nothing and covers the famous; it took the coaches view in
  how-many-rings from 28% to 66%. Hand agents only the remainder, and point them
  at the sources that actually work: institutional staff directories, the Wayback
  CDX index for departed staff, hall-of-fame pages, and obituaries.
- Keep a manifest with source, license and caveat per image, and support a
  `locked` flag so a hand-picked photo survives every re-run.

## Verifying computed rows against an independent source

Learned on `hostile-territory` (1,851 games verified against archived
Sports-Reference pages). When rows are COMPUTED from bulk data rather than
researched, the fleet's job flips: not gathering, but checking every displayed
row against a source the pipeline never touched. What made it work:

- **Corrections are a versioned layer, not edits.** `data/game-corrections.json`
  holds evidence-backed `exclude`/`patch` entries applied before the join, each
  citing its receipt. The bulk data stays as fetched; provenance survives.
  The fleet found 29 exclusions and 9 patches the bulk source had wrong.
- **A discrepancy is a fork, not a fix.** Some fleet flags were the source
  being wrong, not us — adjudicate with a third source before "correcting,"
  and record resolved disputes in a triage file so the coverage report can
  tell triaged from untriaged. Five of five rank disputes resolved AGAINST
  the verification source.
- **Group fetches by the concentrated side of the join.** Verifying visitors
  via host-season pages cut the page count by 60% — ranked hosts repeat.
- **One slice mutation-tested its own checks** (perturb each worklist field,
  confirm everything flips to discrepancy) before reporting zero
  discrepancies. Ask for that when a slice comes back suspiciously clean.
- **A known-answer check is the cheapest coverage gate.** The whole project
  existed because of one broadcast factoid; the report fails unless the
  pipeline reproduces it. It caught missing tenure files twice.
- Sibling agents sharing a scratchpad WILL overwrite each other's helper
  scripts — tell every fleet member to namespace under its own subdirectory.
