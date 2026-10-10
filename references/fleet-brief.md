# The fleet brief and its return contract

The handoff between organizing research and storing claims is the JSON an
agent hands back. A brief that fixes that shape, says what is already known,
and makes rejection cheap gets usable rows; a brief that says "find out who
was on staff" gets prose. Three kinds of brief share one template.

## The template

```
PURPOSE
  Why this data is needed and what it feeds. One paragraph.

WHAT WE ALREADY HAVE
  The full list for your slice — never truncated (cases: rings-truncated-list).
  Report these only if a source contradicts them.

ALREADY RULED IN / OUT
  Sources the probe settled. Do not re-research them.
  Tried, nothing usable: <list>. Don't retry.

EXPECTED BASE RATE
  "Expect most of these to be 'did not field a team'." Coming back mostly
  empty is a valid result.

THE FAILURE MODE WE SUSPECT  (a hypothesis, marked as one)
  "We suspect the thinner season was harvested from a worse source, not that
  everyone left." If the evidence says otherwise, say so; the hypothesis has
  been wrong before (cases: csk-false-premise-prompt).

SOURCE PRECEDENCE
  "Prefer the school's own record book. Log every deviation in the row's note."

VERIFY IN-LOOP
  Quotes will be string-matched against the page; save every page you quote
  under pages/<your-slice>/. Images: curl -sIL and confirm 200 + image/*.

WORKING RULES
  Namespace scratch files under scratch/<your-slice>/.
  Rejections and uncertainty are useful. Don't guess.

RETURN
  The schema below, as JSON, nothing else.
```

## The return schema

```json
{
  "rows": [
    { "...": "the row's own fields",
      "grade": "roster | tenure | clock | label | planned",
      "receipts": [ { "url": "…", "quote": "…", "note": "…" } ] }
  ],
  "rejections": [
    { "claim": "what we had or asked about", "reason": "…",
      "receipts": [ { "url": "…", "quote": "…" } ] }
  ],
  "tried": [
    { "source": "…", "outcome": "nothing usable | blocked (403) | paywalled | no coverage before 1999" }
  ],
  "leads": [
    { "note": "Howell may also omit New Mexico 1944–45", "why_out_of_scope": "…" }
  ],
  "unverified": [
    { "claim": "…", "what_i_tried": "…" }
  ]
}
```

Every section is required, even when empty. The counts are the first thing to
read: a sweep returning 226 confirmations and 309 rejections is trustworthy;
one returning only confirmations is a yes-machine (cases: rings-226-309).
`tried` is the source-level rejection list and saves the next fleet the same
dead ends. `leads` go into the project's leads file on merge (cases:
csk-dropped-lead). `unverified` is the honest bucket: a wrong face is worse
than no face, and a guessed score is worse than a blank.

## Three kinds of brief

**Gathering.** Rows are new. Give the schema for the row, the receipt object,
and the grade vocabulary. Ask for two receipts where an authority exists (an
encyclopedia line plus the record book).

**Verification.** Rows exist; the agent checks each against a source the
pipeline never touched. Rows carry the values the agent extracted from the
page beside the quote, and a `status` of `confirmed` or `discrepancy`. Ask the
agent to mutation-test its own check before reporting zero discrepancies
(cases: ht-mutation-test). Group the worklist by the concentrated side of the
join.

**Feasibility.** "Your goal is not to collect the data. It is to tell me which
sources exist, how far back each goes, and how harvestable each is." Rows are
sources, not facts: span, granularity, form (script / reader / paywall),
three verbatim spot checks from different decades, and whether the source
type generalizes. The `tried` section is the main output.

## On merge

The merge script, not the agent, decides what enters the data: it dedupes
against existing rows (skip on agreement, fail on a score disagreement), drops
rows below the grade cutoff, files leads, and prints what it skipped and why.
Then run `check-receipts.mjs` on the committed pages yourself.
