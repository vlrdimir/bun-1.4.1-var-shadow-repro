#!/usr/bin/env bash
# Repro: bun 1.4.1 bundler emits `var Check2 = Check2` (self-reference / let-collision)
# Run each version's bundle with that same version's runtime:
set -e
cd "$(dirname "$0")"
bun install --frozen-lockfile 2>/dev/null || bun install
for v in 1.4.0 1.4.1; do
  echo "--- bun $v"
  docker run --rm -v "$PWD":/r -w /r "oven/bun:$v-alpine" sh -c \
    "bun build repro.js --outdir=dist-$v --target=bun >/dev/null && bun dist-$v/repro.js"
done
