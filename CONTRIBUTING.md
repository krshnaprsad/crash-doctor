# Contributing

No dependencies. You need Node 18 or newer.

```
npm test
```

That runs `tests/doctor.test.js`: it checks every fix entry is complete, every pattern compiles, and a set of real looking crash texts land on the right fix.

Layout:

- `data/fixes.js` the fixes list
- `src/doctor.js` reads the log and matches it against the list
- `cli/doctor.js` the command line version
- `index.html`, `web/` the app

## Adding a fix

Copy an entry in `data/fixes.js`. Each one has:

- `id`: a short unique name
- `title`: what the user sees as the heading
- `games`: which games it is for (optional, can be an app or a system problem too)
- `match`: patterns checked against the pasted text, each with a weight from 1 (loose) to 4 (very specific). A single weight 4 hit makes it a strong match. Use loose patterns only as a bonus on top of a specific one.
- `cause`: one or two plain sentences on why it happens. You can use `{dll}`, `{module}`, `{java}` to fill in details from the log.
- `steps`: the fix, quickest and most likely first. Put a download link right in the step as `[label](https://...)`. Only official pages, and only ones you have opened. Run `node tools/check-links.js` to see that they load (needs internet; some Microsoft, Intel and Adobe pages answer scripts with 403 and need a manual look).
- `limit` (optional): a plain sentence for entries where the steps are only hints and cannot promise a fix. It shows as an "Honest limit" note.

Then add a line to `tests/doctor.test.js` with a short example log that should land on your entry.

Keep these rules: plain words, no em dashes, no advice to download single dll files from random sites, and nothing that helps get around anti-cheat or game licensing.
