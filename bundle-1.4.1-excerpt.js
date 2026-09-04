// Excerpt from `bun build repro.js --target=bun` output under bun 1.4.1
// (node_modules/elysia/dist/schema.mjs section, ~line 13638):

let Check2 = function(value, validated = false) {
  // ... TypeBox-style schema checker, recurses via Check2 ...
};

// ~line 13673 — ILLEGAL: same-scope redeclaration of `Check2` via `var`,
// self-referencing the TDZ binding above. Bun's own runtime parser rejects this:
//   SyntaxError: Cannot declare a var variable that shadows a let/const/class variable: 'Check2'.
var Check2 = Check2, runCheckers = runCheckers2, mergeValues = mergeValues2;

// Under bun 1.4.0 the same source renames correctly (`Check` -> `Check22`):
//   var Check2 = Check22, runCheckers = runCheckers2, mergeValues = mergeValues2;

// Original source, elysia@1.4.29 dist/schema.mjs:283 — note `Check` vs `Check2`:
//   var Check2 = Check, runCheckers = runCheckers2, mergeValues = mergeValues2;
