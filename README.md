# receipts-research

receipts-research is an agent skill for building trustworthy, auditable datasets. It's inspired by the [Wikibase data model](https://www.mediawiki.org/wiki/Wikibase/DataModel), since Wikidata's need to verify contributions is pretty similar to the problems you run into when building datasets with agents. Claims have to be verifiable!

I developed this skill over the course of building the datasets for projects like [college football streak king](https://drewhoover.com/cfb-streak-king/), [hostile territory](https://drewhoover.com/hostile-territory/), [collegiate championships](https://drewhoover.com/collegiate-championships/), [should you buy an all-time high?](https://drewhoover.com/should-you-buy-an-all-time-high/), [how many rings](https://drewhoover.com/how-many-rings/), [battery life](https://drewhoover.com/battery-life/), and one unreleased one about career longevity in the NBA that I'm really excited about.

The skill is designed declaratively, so that you can bring your own research methodology, persistence strategy, and other constraints as you please.

## When to use it

- An agent fleet is researching data from documents because no dataset exists.
- You have a computed dataset from bulk files and want every displayed row verified against an independent source.
- You have a bulk source with gaps or errors and want to patch it.
- You want per-row citations, a fact-checkable dataset, or to perform novel research! Go where no human (or agent) has gone before!

## What's in it

[`SKILL.md`](SKILL.md) is a router. It lays out six invariants and points to a reference file for each concern:

| File | What it covers |
|---|---|
| [`references/claims.md`](references/claims.md) | The receipt object, evidence grades, versioned rule files, and corrections as a layer over untouched sources. Start here. |
| [`references/audit.md`](references/audit.md) | The quote gate, coverage reports, floors, known-answer gates, and dispute rules. |
| [`references/research-ops.md`](references/research-ops.md) | Scoping, probing a source before harvesting it, how bulk sources lie, and running a fleet. |
| [`references/fleet-brief.md`](references/fleet-brief.md) | A brief template for research and verification agents, and the return schema they have to honor. |
| [`references/stack.md`](references/stack.md) | One opinion on persisting and publishing it as a build-time static site. A Postgres app can ignore this one. |
| [`references/cases.md`](references/cases.md) | The real incidents the rules cite, so you can see why a rule exists. |
| [`scripts/check-receipts.mjs`](scripts/check-receipts.mjs) | The hallucination gate. |

The core idea is that the model never aggregates. Agents extract rows with receipts, and joining happens in the code, so if a total is wrong, the fault can be traced back to a specific data point that you can audit.

## The receipt checker

`check-receipts.mjs` walks any JSON for objects carrying `receipts: [...]` and requires each receipt's `quote` to appear in the text of its `url`. It has no dependencies and needs Node 18+.

```sh
node scripts/check-receipts.mjs --pages data/research/pages data/ref/*.json
```

`--pages` saves each fetched page so the check can re-run offline. Commit that directory. You can drop a `.txt` there yourself for pages a script can't fetch (paywalls, PDFs, bot walls). `--offline` never fetches, and `--loose` also folds curly quotes, dashes, and case. It exits 1 on any quote its page doesn't contain.

## Install

Clone it into your Claude Code skills directory:

```sh
git clone git@github.com:DrewHoo/receipts-research.git ~/.claude/skills/receipts-research
```

The skill is plain markdown and one script, so it should work with any agent harness that loads `SKILL.md`-style skills.

## Contributing

If you hit a case the rules don't cover, or a rule turned out to be wrong, open a PR. A new entry in `cases.md` with the incident behind it is the most useful kind.
