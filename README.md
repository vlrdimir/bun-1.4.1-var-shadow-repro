# bun 1.4.1 bundler emits illegal `var` redeclaration (`var Check2 = Check2`)

## Summary

`bun build --target=bun` under **bun 1.4.1** renames two distinct identifiers (`Check` and
`Check2` in `elysia@1.4.29`'s `dist/schema.mjs`) to the **same** name `Check2`, emitting

```js
let Check2 = function(value, validated = false) { ... };
var Check2 = Check2, runCheckers = runCheckers2, mergeValues = mergeValues2;
```

which is an illegal same-scope `let`/`var` collision (and a TDZ self-reference). Bun's own
runtime parser then rejects the bundle it just produced:

```
SyntaxError: Cannot declare a var variable that shadows a let/const/class variable: 'Check2'.
```

The identical input bundled under **bun 1.4.0** renames correctly (`Check` -> `Check22`,
yielding `var Check2 = Check22`) and runs fine on both 1.4.0 and 1.4.1 runtimes — so this is a
regression in the 1.4.1 bundler's identifier renaming, not in the parser.

## Repro

`repro.js`:

```js
import { t } from "elysia";
const schema = t.Object({ name: t.String() });
console.log("bundle parsed and ran, schema:", typeof schema);
```

```sh
./run.sh   # or manually:
bun install
bun build repro.js --outdir=dist --target=bun   # with bun 1.4.1
bun dist/repro.js                               # -> SyntaxError
```

Docker one-liners (pinned versions):

```sh
docker run --rm -v "$PWD":/r -w /r oven/bun:1.4.1-alpine sh -c \
  "bun install && bun build repro.js --target=bun && bun dist/repro.js"
# -> SyntaxError: Cannot declare a var variable that shadows a let/const/class variable: 'Check2.'

docker run --rm -v "$PWD":/r -w /r oven/bun:1.4.0-alpine sh -c \
  "bun install && bun build repro.js --target=bun && bun dist/repro.js"
# -> bundle parsed and ran, schema: object
```

## Environment

- bun 1.4.1 (bundle + run), `oven/bun:1.4.1-alpine`, linux x64
- bun 1.4.0 (control): `oven/bun:1.4.0-alpine`
- repro dependency: `elysia@1.4.29` (`dist/schema.mjs:283` contains
  `var Check2 = Check, runCheckers = runCheckers2, mergeValues = mergeValues2;`)
- platform: linux x64 (alpine), also observed in a production deploy on `oven/bun:1.4` floating tag

## Observed bad output

See `bundle-1.4.1-excerpt.js`. Full bundle available on request.

## Status (2026-09-05)

Confirmed by Bun maintainers as a duplicate of
[oven-sh/bun#41351](https://github.com/oven-sh/bun/issues/41351) — scope: any non-minified
`bun build` of an app using **elysia ≥ 1.4.28** on **Bun 1.4.1**. Fix in progress:
[oven-sh/bun#41354](https://github.com/oven-sh/bun/pull/41354).

**Maintainer-endorsed workaround until it ships:** build with `--minify-identifiers`
(or `--minify`) — the identifier minifier uses a different renamer that does not have
this bug. This repo stays up as a verification case for the fix.
