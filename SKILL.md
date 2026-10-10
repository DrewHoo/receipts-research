---
name: receipts-research
description: Gather, verify, and present data so every displayed claim stands up to an audit — each number traces to a receipt a reader can open, code does the counting, corrections are a visible layer over untouched sources, and the dataset reports its own coverage. For agent-built data work where the fear is hallucinated or misrepresented data, the expensive visualization nobody can trust. A router with reference files: how a claim is stored (a shared receipt object with verbatim quotes), how a dataset is audited (the quote gate, coverage report, floors, known-answer gates), how research is organized (probe before harvest, fleet briefs that reject as well as confirm), and one opinion on persisting, querying, and publishing it; plus a script that string-checks every receipt. Use when accuracy and independent verifiability matter (a journalistic standard; anything a reader might fact-check), when the user asks for per-row citations or receipts, wants a computed dataset verified row-by-row, needs data researched because no dataset exists, or asks how far back a dataset can go
---

# Data that survives an audit

An anticipated reservation against using agents to do data-driven visualizations is their reliability as researchers; they can hallucinate or misinterpret data and it's hard to sort out after the initial research is done. This skill is the method for making the data
trustable: every displayed claim traces to a receipt a reader can open, and the data is structured so that derived information is always derived, corrections sit in a visible layer over sources left as
fetched, and the dataset reports what it does not cover. The standard is
journalistic. A reader can check any number against the source it came from,
and a wrong one can be shown wrong.

It applies whether the data is downloaded, researched from documents by an
agent fleet, or both. Three open source projects shaped the skill, and `references/cases.md`
holds the incidents the rules cite.

## Three shapes of the job

1. **Research everything.** No dataset exists; a fleet assembles every row from
   documents (`how-many-rings`: ~1,300 championship staffers from 40 staffs,
   each row carrying the line that proves it).
2. **Verify computed rows.** The dataset came from bulk files; a fleet checks
   every displayed row against a source the pipeline never touched
   (`hostile-territory`: 1,851 games against archived pages).
3. **A bulk spine with researched patch layers.** A bulk source carries the
   ordinary rows; research fills versioned exception files — errata, bridged
   gaps, missing games, rulings — each row with its receipt
   (`cfb-streak-king`: 90 seasons, 48,000 games, 37 researched wartime games
   that kept 35 teams' histories intact; cases: csk-wartime-bridges).

## The invariants

1. **Every displayed claim can be traced to a receipt** a reader can open: a URL and
   the verbatim line that supports it, in one shared shape. → `claims.md`. Receipts may be displayed in the UI but either way they must be open source, or else they aren't independently verifiable.
2. **The model never counts.** Agents extract rows; code joins, counts, and
   ranks, so a wrong total can only come from a wrong, auditable row.
   → `stack.md`
3. **Judgment is a versioned rule file; a correction is a layer**, applied
   over sources left exactly as fetched, failing loud when it goes stale.
   → `claims.md`
4. **The hallucination gate is mechanical.** Every quote is string-matched
   against a saved copy of its page, and the saved pages are committed.
   → `scripts/check-receipts.mjs`, `audit.md`
5. **The dataset reports its own coverage**, and the UI names the floor that
   binds a claim. Unknown is not false. → `audit.md`, `stack.md`
6. **Fleets reject as well as confirm**, and a probe runs before any harvest.
   → `research-ops.md`, `fleet-brief.md`

## The files

| File | Read it when |
|---|---|
| `references/claims.md` | Deciding how a row, its evidence, a rule, or a correction is stored. Start here. |
| `references/audit.md` | Writing the checks: the quote gate, coverage report, floors, known-answer gates, dispute rules. |
| `references/research-ops.md` | Agents are about to search for data: feasibility, source traps, batching, cost, assets. |
| `references/fleet-brief.md` | Writing a prompt for a research or verification agent; the return schema it must honor. |
| `references/stack.md` | Using the static-site build pattern: file layout, apply order, how the app reads and publishes. One implementation, labeled as such. |
| `references/cases.md` | A rule cites `(cases: slug)` and you want the incident behind it. |
| `scripts/check-receipts.mjs` | Run against any JSON carrying `receipts`; exits 1 on a quote its page does not contain. |

Claims and audit are the method and stand on their own. Research-ops and the
fleet brief matter only when agents gather or verify. The stack file is our
opinion for a build-time static site; a Postgres app keeps the first four and
ignores it.
