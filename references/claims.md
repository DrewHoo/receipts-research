# How a claim is stored

A claim is a row (a game, a person on a staff, a season a team did not play)
plus the evidence that it is true. This file fixes the shape of the evidence,
the files that hold judgment, and the layer that holds corrections. Nothing
here depends on how the research was organized or what application reads the
result.

## The receipt object

Every project so far re-derived the same receipt with new spellings
(`sources[].url` / `source_url` / `source`, quote sometimes verbatim and
sometimes a label, cross-references as prose; cases: ht-triage-keys), so no
two files could share a checker and the quote matcher got rebuilt each time.
Fix the vocabulary once. A receipt is one of two forms:

```json
{ "url": "…", "quote": "…", "note": "…", "retrieved": "2026-09-29" }
{ "sources": ["howell", "cfbd"], "note": "…" }
```

- `url` — the page that proves the claim. Prefer an archival URL (a Wayback
  snapshot carries the as-of date in the locator); otherwise add `retrieved`.
- `quote` — the verbatim line, matched whitespace-collapsed against the page
  (`scripts/check-receipts.mjs`). PDF text and table cells join with single
  spaces, so an exact match fails on good rows (cases: csk-whitespace-match).
- `note` — where in the page the quote sits, and anything a future auditor
  needs ("title cell paired with the name cell 'Gary Barnett'").
- The second form is for entries adjudicated by comparing named datasets,
  such as a majority vote across three sources. There is no quotable line; a
  fabricated quote would be worse than naming the vote.

A claim carries `receipts`, a list, even when it has one. Rows routinely need
two (a Wikipedia quote plus the school's record book). Sibling fields beyond
these are fine: a verification record carries the values it extracted from
the page beside the quote, because its job is to disagree with the pipeline.
The checker reads only the fields named here.

The same object rides in three positions: embedded in a gathered row, as a
standalone verification record keyed to a row, or justifying a correction
entry's action. The one form to refuse is the floating receipt: citations in
a file-level prose note that no entry points at, so nobody can say which row
a given line proves (cases: csk-coach-overrides-note).

The lineage is Wikidata's reference model — reference URL (P854), quotation
(P1683), retrieved (P813), stated in (P248), with statement ranks playing the
role of status fields and triage files. Borrow the vocabulary, not the
serialization; snaks and typed datavalues are built for a billion-statement
store, not a 39-row file a human diffs.

## Why the quote is verbatim

1. It is mechanically checkable. A hallucinated row cannot survive a string
   match against the page.
2. It becomes the UI. Each claim links out with its quote in the `title`.
3. It makes agents concrete. "Return the exact line" produces better
   extraction than "tell me who was on staff."

## Grade the evidence, and show the grade

A row sourced from a staff list and a row inferred from a documented
employment span are not the same claim. Name the grade on the row (`roster`
vs `tenure`; `clock` vs `label` vs `planned`) and label the weaker kind in the
UI. Mixing grades silently is the fastest way to lose a reader when one soft
claim turns out wrong. Some grades must not count toward completeness: a
`planned` kickoff time or a stadium-lights inference says nothing about a
team's data floor.

Separate "it happened" from "it counts." A wartime game the school does not
count carries `counted_by_school: false`; an unofficial season bridges a gap
with no games ingested (cases: csk-stanford-1945). A played-but-unofficial row
corrupts the data with a true fact.

## Judgment is a versioned rule file

Every judgment that can be a rule is a rule in a file, not a per-agent
decision, so one change re-scores the whole dataset consistently:

- who counts (`employment-rules.json`: patterns plus the reason shown in the
  UI);
- the same entity spelled differently across sources (`name-aliases.json`);
  a merge that mints a fresh id on every alias miss is a silent split
  generator, so count the minted ids;
- which off-campus sites count as home for which team (`alt-home.json`).

Two habits keep rule files honest:

- **Derive the rule from adjudicated cases, then prove it reproduces them.**
  Pick the hard cases by eye, write the rule afterward, re-run it over
  everything already decided, and require a zero-file diff before extending
  it to new cases (cases: csk-logo-rule-zero-diff).
- **Print the review table.** The parser prints every (team, city) pair it saw
  so a new pair is reviewed into the rule file instead of guessed from memory.

Each rule file carries `version`, `updated`, and a `note` that says what the
file rules, how a row gets in, and what the build does with it.

## Corrections are a layer, not edits

The bulk source stays exactly as fetched. A corrections file holds
evidence-backed entries applied before the join — `exclude`, `patch`, a score,
a swapped home team, a moved date — each with its `receipts` (cases:
ht-corrections-29-9). Requirements on the layer:

- **Fail loud when stale.** If an entry matches no row, the source fixed it or
  the key drifted; either way the build stops (cases: csk-errata-stale-throw).
- **Anchor on stable keys.** The date of a coach's first game, not a game
  ordinal; ordinals shift when the spine gains a game.
- **A disagreement is a fork, not a fix.** Adjudicate with a third source
  before correcting, and record the resolution in a triage file keyed to the
  claim so the coverage report can tell triaged from untriaged (cases:
  ht-rank-disputes). Spend adjudication where it moves a number; a dispute
  that changes no output can stay open with its note (cases: csk-uconn-colgate).
- **Keep a leads file.** Agents raise things outside their brief ("Howell may
  omit these two seasons too"). An unfiled lead is a dropped lead (cases:
  csk-dropped-lead).
- **Report upstream.** Issue drafts for the source's maintainers, ambiguous
  cases framed as questions, checked-but-correct cases noted so nobody
  re-litigates them. Publishing the corrections as their own public repo is
  the strong form (cases: csk-repole-errata-public).
