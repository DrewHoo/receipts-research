# Cases

The incidents behind the rules, by project. A rule in the other files cites
one as `(cases: slug)`. Each entry says what happened, what caught it, and
what rule it produced.

## how-many-rings

Championship rings per college football staffer, 1990–present. ~1,300 people
from 40 championship staffs, every row with its receipt. Fleets of 13–22
agents, 20–50 minutes.

### rings-depth-asymmetry
Two championship staffs two years apart should share ~75% of people. One pair
shared 33%. The thin season had been harvested from a worse source; the gap
read as turnover. Rule: measure overlap between entities that should share
members.

### rings-photographer
A photographer credited for 2017 and 2020 looked fine until a source showed
he started in 1986. Rule: flag partial membership in roles that imply full
membership.

### rings-dedupe-69-60
An audit fleet "found" 69 missing people; 60 were already in the data. Rule:
every merge dedupes, and every brief carries the full list of what exists.

### rings-truncated-list
The existing-people list in a brief was truncated to save tokens. Three
agents independently declared people "missing" who were in the cut tail.
Rule: never truncate what-we-have; omit it entirely before truncating it.

### rings-226-309
A sweep returned 226 confirmations and 309 rejections. Rule: rejection counts
are the best available proxy for skepticism; a confirm-only sweep is a
yes-machine.

### rings-og-landscape
A bio page with no photo served the school logo as `og:image`. It downloaded,
passed a content-type check, and was landscape. Rule: check asset shape.

### rings-portraits-28-66
A Wikipedia/Commons pass with a license check took the coaches view from 28%
to 66% portrait coverage before any agent ran. Rule: free pass first.

### rings-visible-set
A well-known name sat at rank 297 overall and rank 87 inside one filter.
Rule: the set needing assets is the union of every filter's top N.

## hostile-territory

1,851 computed games verified against archived Sports-Reference pages.
Verification records in `data/research/receipts-*.json`, corrections in
`data/game-corrections.json`, adjudications in `receipt-triage.json`.

### ht-corrections-29-9
The fleet found 29 games to exclude and 9 to patch in the bulk source. All
went into a corrections file applied before the join, each citing its
receipt; the bulk data stayed as fetched.

### ht-rank-disputes
Five rank discrepancies flagged by the verifier. A third source (ESPN plus
the poll archive) sided with the pipeline all five times. Rule: a
discrepancy is a fork; adjudicate before correcting; record it in triage.

### ht-host-season-pages
Verifying visitors through host-season pages cut page fetches 60%, because
ranked hosts repeat. Rule: group fetches by the concentrated side of the join.

### ht-mutation-test
One slice perturbed each worklist field and confirmed every perturbation
flipped to discrepancy before reporting zero discrepancies. Rule: ask for
this when a slice comes back clean.

### ht-known-answer-factoid
The project existed because of one broadcast factoid. The coverage report
fails unless the pipeline reproduces it; it caught missing tenure files
twice.

### ht-scratchpad-overwrite
Sibling agents sharing one scratchpad overwrote each other's helper scripts.
Rule: every agent namespaces under its own subdirectory.

### ht-triage-keys
Triage entries were keyed `"2001-08-25|TCU"` by convention, and correction
`reason` strings cited the receipts file as `(receipts-2)` in prose. It
worked for one project and is the kind of drift the receipt object exists to
stop.

## cfb-streak-king

90 seasons of games from bulk sources (Howell's pages, Repole's spread files,
CFBD), patched by researched ruling files in `data/ref/`. Patch-layer fleets
of 3–6 agents, 20–25 minutes.

### csk-wartime-bridges
Howell ends a team's span on any season he doesn't list. A 1936 window would
have cut ~35 teams' histories at 1943–45, Alabama included. Three agents
researched 49 team-seasons: 37 wartime games added, 41 seasons bridged, each
with a URL and a verbatim quote. Proving a gap empty found two spring-2021
games no source carried.

### csk-cfbd-howell-lineage
CFBD matched Howell on 952 of 980 games in 1955 with zero score differences.
It descends from the same data, so it checks the parsing, not the scores.
Rule: trace lineage before counting a source as a vote.

### csk-uconn-colgate
UConn–Colgate 2000 has three scores across four sources. UConn won in all of
them, so no streak changes; it stays unresolved with a note. Rule: a
disagreement only blocks if it changes the output.

### csk-utah-2004
Utah credits the 2005 Fiesta Bowl to both Meyer and Whittingham. The source
is right; the one-coach-per-game model forces a documented choice. Drew's
prompt: "why do you think cfbd has so much bad data? are we misinterpreting
it somehow?"

### csk-tulane-second-victim
Tulane's 2011 interim stint was filed under 2012 by the source. 2012 looked
impossible and was investigated; 2011 looked resolved and credited the fired
coach with all 13 games. Louisville 2018 had the same shape. Rule: a misfiled
row has a second victim.

### csk-399-bowls
The coach resolver matched each coach's W–L record as a prefix of the team's
result sequence. 42 seasons didn't resolve. The cause was not the coach data:
every bowl from 2014–2022 was missing from the schedule source, and the bowls
chip had been silently wrong for a decade. Every famous-streak gate had
passed. Rule: reconcile datasets against each other; a gate covers only what
it checks.

### csk-known-answers-wrong
Two hand-entered known answers were wrong (a losing streak's end date, a test
fixture's date); the data was right both times. Rule: when a gate fails,
verify the answer before fixing the data.

### csk-kickoff-probe
"Can night-game data go back before 2002?" The payload already had kickoff
hours for 89–96% of games from 2002 on; 2001 was all midnight placeholders. A
scripted probe of 232 Wikipedia season pages, stratified by era × tier,
showed a page has times for every game or none, and ~27% coverage of
non-major programs before 2002. Those numbers went into every fleet brief.

### csk-southern-miss
The feasibility fleet took one school each: LSU (famous night tradition),
Penn State (no lights for much of the period), Nebraska (no Wikipedia times,
strong fan archive), BYU (Mountain time, cross-zone opponents), and Southern
Miss, chosen as the negative case: a non-power program with no TV. A sixth
agent covered cross-school sources.

### csk-newspapers-tos
Wikipedia's kickoff times cite newspapers.com clippings, whose terms bar bulk
and AI access. The spec laid out human-pace lookups, a permission email, and
library databases, and left the call to Drew. Rule: check terms before
scaling onto a source.

### csk-placeholder-times
CFBD's 2001 times are all midnight. ESPN's pre-2001 times are midnight with
`timeValid: false`. huskers.com shows 18:00/19:00 for every pre-1999 game
(midnight UTC in Central). southernmiss.com's 2001 times run exactly an hour
off. "(N)" means neutral site, not night, in three guides. OCR turns
Nebraska's "^" marker into A, 4, *, ', !. LSU's day/night markers were
reconstructed around 2008 and changed between the 2013 and 2025 guides. Penn
State's own "night games" list is missing two 1992 road games the student
paper confirmed. Every school draws "night" at a different hour.

### csk-howell-colors
Howell marks each score's verification status with a color. Measured by era:
92% verified for 1936–77, 75% before 1936. The window starts at 1936.
"Stopping at 1936 is a product call, not a data limit."

### csk-central-michigan
A ΔE color-distance check flagged 59 of 136 logos for a dark variant. Drew
asked "what about central michigan?" A luminance-contrast pass found 22 more
teams the first metric had let through. Rule: a human counterexample means a
class-shaped blind spot; add a second measure.

### csk-logo-rule-zero-diff
Dark variants were picked by eye for the flagged set; the two-measure rule was
written afterward. Re-running it over all 136 marks changed zero files. Only
then was it applied to 230 new opponent marks, 20 of which were spot-checked.

### csk-opponent-logos-gate
Color marks covered the 136 FBS teams. A feature started drawing every
opponent's logo, and Drew noticed Howard, Western Illinois, UTRGV, and
Indiana State missing. The fix was a build check: the payload may not name an
ESPN id without both marks committed. Six teams stay as initials because ESPN
has no image; that list is printed, not hidden.

### csk-join-rate-93
The 2002–2013 join between schedule and kickoff data hit 93.1% against the
agent's own stated target of 97%. The gap was explained ("unjoined games lack
start hours") and never investigated. Rule: a missed threshold is a finding.

### csk-floor-copy-2002
A night-game streak showed "runs past the start of the data (1978)." The
field's real floor is 2002. Drew: it should say "earliest night game data is
2002; this streak may be longer than we can show." The fix computes the
binding floor from the active chips.

### csk-coach-overrides-note
`coach-overrides.json` holds 32 researched coach seasons. Its receipts
(Spokesman-Review 1996-11-17, ESPN) live in one file-level `_note` string;
no segment points at the line that proves it. The same file got one thing
right: segments anchor on the date of a coach's first game, because the spine
was missing a game and an ordinal would have landed wrong.

### csk-errata-stale-throw
`parse-repole.mjs` throws when an errata entry matches no row in the source
file, so a corrected upstream or a drifted key stops the build instead of
silently applying nothing.

### csk-scratchpad-pages-died
Each wartime agent saved `pages/` and a `build.py` that regenerates its
results and re-runs the quote check. They lived in the session scratchpad.
The merged rows were committed; the pages and checker were not, and the main
agent never re-ran the check itself before writing "quotes string-checked
against the saved pages" into the data file's note.

### csk-dropped-lead
The wartime-West agent flagged that New Mexico and Utah State 1944–45 were
played and asked whether Howell omits them too. No follow-up exists anywhere
in the session. Rule: a leads file, filed on merge.

### csk-ci-zero-lined
`cfbd()` fetched lines and then wrote a cache copy to a gitignored directory
inside the same `try`. In CI the write threw ENOENT and the catch discarded
the fetched data; every build for a week shipped the season with "0 lined."
Drew noticed a wrong-looking streak in a screenshot. Fix: exit 1 when
completed games exist and none have lines, fall back to the committed
payload, and check the "(N lined)" log line after deploy.

### csk-whitespace-match
Both wartime agents reported quote matches failing until whitespace was
collapsed: PDF text and table cells join with single spaces.

### csk-stanford-1945
Stanford played an unofficial 1945 schedule the school does not count. The
season bridges the span gap with no games ingested; the games sit in an
`informal_games` bucket marked "for reference only."

### csk-false-premise-prompt
One subagent brief said to prefer sports-reference "since the pipeline's
other checks were validated against it." That was false for this pipeline.
The same brief stated a hypothesis about Boise State 1996 as "I believe …
verify"; it was backwards, and the agent rejected it because the framing
allowed it to.

### csk-receipt-migration
Moving the four older ruling files onto the receipt object (2026-10-10) and
running the gate over all 646 receipts found: 4 extra-game rows whose page
had changed shape (Wikipedia's Parsoid HTML puts wikitext in `data-mw`
attributes, `>` included, so a naive `<[^>]+>` stripper spills attribute
text into the page; and a schedule table's non-conference `*` now sits in
its own element, so "Whitman*" reads "Whitman *"); 3 PDF sources (media
guides, a fact book) a fetch can't read, whose text PyMuPDF extracted into
the saved-pages directory by hand; one page that had gone behind a bot wall
since September, re-pointed at its Wayback snapshot; Wikipedia rate-limiting
(429) after a few hundred quick fetches; and two rows that had named their
page without a quote. Coach rulings got receipts by deriving each season's
Wikipedia page from team name plus mascot — 132 of 138 on the first pass,
the rest under historic names (Colgate Red Raiders, Texas Mines). Every
one of these was invisible until the gate ran against saved pages; the
data file's note had said "quotes string-checked against the saved pages."

### csk-repole-errata-public
78 corrections to Repole's spread files, each confirmed against Howell and,
where they exist, cfbfastR and CFBD, exported to a public CC0 repo after
Drew's OK. Four issue drafts went to CFBD's maintainers, the ambiguous case
framed as a question and the checked-but-correct case footnoted.
