# One way to persist, query, and publish

This is the implementation the three projects share: a static site built by
scripts, data baked at build time, no server. It is one opinion. The claims
and audit files do not depend on it; an application with a database keeps
them and swaps this.

## Layout

```
data/raw/        bulk sources exactly as fetched (gitignored or committed, never edited)
data/ref/        ruling files: rules, aliases, corrections, researched rows — versioned JSON
data/research/   receipts, triage, leads, saved pages (committed)
scripts/data/    one parser per source, the build, the coverage report, the checks
src/data/        the baked payload the app reads
```

Every `data/ref` file has `version`, `updated`, and a `note` that says what
the file rules, how a row gets in, and what the build does with it. The note
is the file's documentation; a reader opening the JSON cold should not need
anything else.

## Apply order

The build is a pipeline with a fixed order, and the order is the method:

1. Parse each bulk source into rows. Report unmatched names with counts;
   never drop them silently.
2. Apply corrections. An entry that matches no row stops the build.
3. Merge researched rows. A row that duplicates a bulk row is skipped if the
   scores agree and stops the build if they don't — four agreeing duplicates
   are also a free accuracy check on the fleet.
4. Apply rule files (who counts, aliases, home sites). Print the review
   tables.
5. Join, count, rank. This is the only place totals come from.
6. Run the known-answer gates and the coverage report.
7. Write the payload last. A failed check leaves the committed file alone.

## How the app reads

The app reads the payload and nothing else. It never recomputes from raw
data, and it never counts; the payload carries the rows and the app
evaluates definitions over them. Floors ride in the payload per field, and a
query's binding floor is computed from the fields it actually uses, so the UI
can name it.

## Publication is part of the method

Falsifiable means a reader can see the receipt:

- Each claim links out, with its quote in the `title` attribute, so hovering
  shows the line and clicking shows the page.
- Evidence grades are labeled in the UI; the weaker kind is visibly weaker.
- The binding floor is named on the claim it limits ("earliest night game
  data is 2002; this streak may be longer than we can show").
- Copy names the pool a number was counted over. "Why isn't it 50%? Which
  teams are we talking about" is a question the page should pre-empt.
- The corrections layer is published as its own public repo under a
  permissive license, with the comparison that produced each entry (cases:
  csk-repole-errata-public). Issue drafts go to the source's maintainers.
- Publishing with visible gaps is a deliberate strategy: readers correct a
  false claim faster than they fill a blank. The gap has to be visible for
  that to work.

## Pipeline guards

The ways a correct method still shipped wrong data, each now a check:

- **A required field 0% filled fails the build**, and CI falls back to the
  last good artifact. A cache write wrapped in the fetch's `try` threw away
  the fetched data for a week; every deploy shipped a season with no lines
  (cases: csk-ci-zero-lined). Never put the cache write in the fetch's `try`.
- **Log one count per build and check it after deploy** ("N games, M lined").
- **Rebuild without the cache before committing a payload.** A stale cache
  nearly committed a regression twice.
- **Diff the built payload against the committed one** after every ingest,
  semantically, and look at the outliers.
- **The build's known-answer gates run before the write**, never after.
