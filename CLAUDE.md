# CLAUDE.md

Ranked voting library in `votes/`. `yarn qa` runs everything.

- `@typescript/native` looks unused but provides `tsc` (TS 7); `typescript` is
  TS 6 for ESLint.
- npm trusted publishing is bound to `.github/workflows/main.yml`: don't rename
  it.
- Check a behavior change against the previous build:
  `git archive <sha> votes/src`, bundle it with esbuild, compare outputs on
  random profiles.
- `votes/src/invariants.test.ts` checks every method's invariants on random
  profiles: list a new Condorcet method there.
- Round methods' `tieBreakers` input is internal: `Election` fills it with the
  methods after each, already built. Tests reach round traces through `firstRun`
  (`votes/src/test/test-utils.ts`).
- Betas publish from a clean local tree, no commit or push. Forge 5 dropped
  `lzear-prerelease`: run its last version
  (`git -C ../forge show 5066690~:packages/configs/src/prerelease.mjs`, its two
  `./` imports pointed at `node_modules/@lzear/configs/src/`) as
  `yarn node prerelease.mjs beta [--publish]` (`npm login` first, npm asks for
  2FA).
