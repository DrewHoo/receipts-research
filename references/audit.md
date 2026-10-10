# How a dataset is checked

The failure modes of a researched or computed dataset are invisible in the
finished product. The page looks equally confident whether it is complete or
missing a third of its rows, whether a number is sourced or invented. These
are the checks that make the difference visible, and the rules about the
checks themselves. Run them after every merge, and before the artifact is
written.

## The quote gate

`scripts/check-receipts.mjs` walks any JSON for objects carrying `receipts`
and requires each `quote` to appear, whitespace-collapsed, in the text of its
`url`. Run it with `--pages DIR` and commit the directory: the saved pages are
the only thing a quote can ever be checked against again once a page changes,
goes behind a wall, or was only ever reachable through a reader (cases:
csk-scratchpad-pages-died). A page a script cannot fetch gets its text dropped
into `DIR/<sha1(url)>.txt` by hand or by the agent that read it.

Do not trust an agent's report that it checked its own quotes. Run the gate
yourself, on the committed pages. The first full run over a project that had
"string-checked" its quotes by agent report found four page-shape changes,
three PDFs no fetch could read, and a page gone behind a bot wall (cases:
csk-receipt-migration).

## The coverage report

Write `scripts/coverage-report.mjs` that measures what you cannot see, and
have each check print its suspects, not just a count. The point is a work list
for a human or the next fleet. Checks that earned their place:

| Check | What it catches |
|---|---|
| **Depth asymmetry** — overlap between two entities that should share members | One source was richer than another, so a harvesting artifact reads as a real difference (cases: rings-depth-asymmetry). |
| **Partial membership** — credited for some of a group's events in a role implying all of them | The undercount contiguous data hides (cases: rings-photographer). |
| **Name-variant splits** — same surname, compatible first names, same entity | One entity silently becoming two, each below the display cutoff. Detect across all rows, not the ones that made the cut, and count ids minted on alias misses. |
| **Asset shape** — aspect ratio, dimensions, byte size | A missing photo served as the site logo passes a content-type check; the only tell is that it is landscape (cases: rings-og-landscape). |
| **Reconciliation** — one dataset's totals against another's rows | Matching each coach's W–L record as a prefix of the team's results audited both sides at once (cases: csk-399-bowls). |
| **Lineage** — do two agreeing sources share an upstream? | A descendant source checks your parsing, not the facts (cases: csk-cfbd-howell-lineage). |

## Floors: unknown is not false

Every field has a date before which the source has nothing, and the floor
differs by field and often by entity. Keep the floors as data, compute the
binding floor from the fields a query actually uses, and name it in the UI:
"earliest night game data is 2002; this streak may be longer than we can
show," not "runs past the start of the data" (cases: csk-floor-copy-2002). A
streak or count must not silently jump a gap.

## Known-answer gates

The build fails unless it reproduces a handful of famous answers, enders
included, and the gates run before the artifact is written (cases:
ht-known-answer-factoid). Two caveats:

- When a gate fails, verify the hand-entered answer before "fixing" the data.
  Two of ten gates were themselves wrong, with the data right both times
  (cases: csk-known-answers-wrong).
- A gate covers only what it checks. 399 missing bowl games passed every
  streak gate and were caught by an unrelated reconciliation (cases:
  csk-399-bowls).

## Dispute rules

- **A discrepancy is a fork, not a fix.** Some flags are the verification
  source being wrong. Adjudicate with a third source; five of five rank
  disputes resolved against the verifier (cases: ht-rank-disputes).
- **A disagreement only blocks if it changes the output.** Three scores across
  four sources, same winner, no streak changes: it stays open with a note
  (cases: csk-uconn-colgate).
- **Before calling the source wrong, ask whether your model is stricter than
  its semantics.** A source that credits one bowl to two head coaches is not
  wrong; a one-coach-per-game model forces a documented choice (cases:
  csk-utah-2004).
- **Look for second victims.** A misfiled row makes one place look impossible
  and a second look clean but wrong (cases: csk-tulane-second-victim). When
  you find a misfiled row, ask where it came from.

## Rules about the checks themselves

- **A missed self-set threshold is a finding, not a footnote.** A 93.1% join
  rate against a stated 97% target got a rationale instead of an
  investigation, and the shortfall was never explained (cases:
  csk-join-rate-93). Adjudicate it or escalate it.
- **When a feature widens the displayed set, widen the gate with it, as a
  failing test.** Assets covered the 136 teams until a feature drew every
  opponent's; the durable fix was a build check, not another audit (cases:
  csk-opponent-logos-gate).
- **A human's single counterexample means the check's blind spot is
  class-shaped.** "What about Central Michigan?" exposed 22 more teams a
  color-distance check had passed. Add a second, different measure; don't
  patch the one row (cases: csk-central-michigan).
- **Mutation-test a clean slice.** Perturb each worklist field and confirm
  everything flips to discrepancy before accepting a zero-discrepancy report
  (cases: ht-mutation-test).
- **Diff the built artifact against the committed one after every ingest**,
  and look at the outliers the ingest produced. "Only the intended changes:
  2 added games, 5 spans" is the sentence you want to be able to write.
