# CLAUDE.md

Ranked voting library in `votes/`. `yarn qa` runs everything.

- `@typescript/native` looks unused but provides `tsc` (TS 7); `typescript` is
  TS 6 for ESLint.
- npm trusted publishing is bound to `.github/workflows/main.yml`: don't rename
  it.
- Check a behavior change against the previous build:
  `git archive <sha> votes/src`, bundle it with esbuild, compare outputs on
  random profiles.
- Round methods' `tieBreakers` input is internal: `Election` fills it with the
  methods after each, already built. Tests reach round traces through `firstRun`
  (`votes/src/test/test-utils.ts`).
