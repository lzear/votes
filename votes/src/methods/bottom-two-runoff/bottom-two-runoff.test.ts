import { tb } from '../../classes/tiebreaker'
import { Borda } from '../borda'
import { RandomCandidates } from '../random-candidates'
import { BottomTwoRunoff } from '.'

describe(BottomTwoRunoff, () => {
  it('works with standard example', () => {
    const input = {
      ballots: [
        {
          id: 'r-c0slp6d2yrp',
          ranking: [['😡'], ['🎽'], ['🤡'], ['🤥'], ['🔏']],
          weight: 2,
          idx: 0,
        },
        {
          id: 'r-lwa51filch',
          ranking: [['😡'], ['🤡'], ['🎽'], ['🤥'], ['🔏']],
          weight: 1,
          idx: 1,
        },
      ],
      candidates: ['😡', '🤡', '🤥', '🔏', '🎽'],
    }
    const bo = new BottomTwoRunoff(input)
    expect(bo.rounds()).toMatchInlineSnapshot(`
      [
        {
          "candidates": [
            "😡",
            "🤡",
            "🤥",
            "🔏",
            "🎽",
          ],
          "eliminated": [
            "🔏",
          ],
          "index": 0,
          "qualified": [
            "😡",
            "🤡",
            "🎽",
            "🤥",
          ],
          "scores": {
            "🎽": 0,
            "🔏": 0,
            "😡": 3,
            "🤡": 0,
            "🤥": 0,
          },
          "tieBreakSteps": [
            {
              "candidates": [
                "🤥",
                "🔏",
              ],
              "index": 0,
              "name": "FirstPastThePost",
              "ranking": [
                [
                  "🤥",
                ],
                [
                  "🔏",
                ],
              ],
              "remaining": [
                "🔏",
              ],
              "resolved": [
                "🤥",
              ],
              "scores": {
                "🔏": 0,
                "🤥": 3,
              },
            },
          ],
        },
        {
          "candidates": [
            "😡",
            "🤡",
            "🎽",
            "🤥",
          ],
          "eliminated": [
            "🤥",
          ],
          "index": 1,
          "qualified": [
            "😡",
            "🎽",
            "🤡",
          ],
          "scores": {
            "🎽": 0,
            "😡": 3,
            "🤡": 0,
            "🤥": 0,
          },
          "tieBreakSteps": [
            {
              "candidates": [
                "🤥",
                "🤡",
              ],
              "index": 0,
              "name": "FirstPastThePost",
              "ranking": [
                [
                  "🤡",
                ],
                [
                  "🤥",
                ],
              ],
              "remaining": [
                "🤥",
              ],
              "resolved": [
                "🤡",
              ],
              "scores": {
                "🤡": 3,
                "🤥": 0,
              },
            },
          ],
        },
        {
          "candidates": [
            "😡",
            "🎽",
            "🤡",
          ],
          "eliminated": [
            "🤡",
          ],
          "index": 2,
          "qualified": [
            "😡",
            "🎽",
          ],
          "scores": {
            "🎽": 0,
            "😡": 3,
            "🤡": 0,
          },
          "tieBreakSteps": [
            {
              "candidates": [
                "🤡",
                "🎽",
              ],
              "index": 0,
              "name": "FirstPastThePost",
              "ranking": [
                [
                  "🎽",
                ],
                [
                  "🤡",
                ],
              ],
              "remaining": [
                "🤡",
              ],
              "resolved": [
                "🎽",
              ],
              "scores": {
                "🎽": 2,
                "🤡": 1,
              },
            },
          ],
        },
        {
          "candidates": [
            "😡",
            "🎽",
          ],
          "eliminated": [
            "🎽",
          ],
          "index": 3,
          "qualified": [
            "😡",
          ],
          "scores": {
            "🎽": 0,
            "😡": 3,
          },
          "tieBreakSteps": [
            {
              "candidates": [
                "🎽",
                "😡",
              ],
              "index": 0,
              "name": "FirstPastThePost",
              "ranking": [
                [
                  "😡",
                ],
                [
                  "🎽",
                ],
              ],
              "remaining": [
                "🎽",
              ],
              "resolved": [
                "😡",
              ],
              "scores": {
                "🎽": 0,
                "😡": 3,
              },
            },
          ],
        },
      ]
    `)
  })

  it('keeps its tieBreakers on restrict', () => {
    // b and c tie for the bottom two and head to head, so the caller's
    // tiebreaker runs after the built-in FPTP one.
    const b2r = new BottomTwoRunoff({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b'], ['c']], weight: 1 },
        { ranking: [['a'], ['c'], ['b']], weight: 1 },
        { ranking: [['b'], ['c']], weight: 1 },
        { ranking: [['c'], ['b']], weight: 1 },
      ],
      tieBreakers: [tb(RandomCandidates, { rng: () => 0 })],
    })
    expect(
      b2r.rounds()[0]?.tieBreakSteps?.map(({ name }) => name),
    ).toStrictEqual(['FirstPastThePost', 'RandomCandidates'])
    const restricted = b2r.restrict(['a', 'b', 'c']) as typeof b2r
    expect(restricted.rounds()).toStrictEqual(b2r.rounds())
  })

  it('breaks a full first-choice tie with its tieBreakers', () => {
    const b2r = new BottomTwoRunoff({
      candidates: ['a', 'b', 'c'],
      ballots: [
        { ranking: [['a'], ['b'], ['c']] },
        { ranking: [['b'], ['a'], ['c']] },
        { ranking: [['c'], ['a'], ['b']] },
      ],
      tieBreakers: [Borda],
    })
    expect(b2r.ranking()).toStrictEqual([['a'], ['b'], ['c']])
  })

  it('does not depend on candidate order', () => {
    const ballots = ['bdac', 'abdc', 'bcda', 'abdc'].map((order) => ({
      ranking: order.split('').map((c) => [c]),
      weight: 1,
    }))
    const rankings = new Set(
      [0, 1, 2, 3].map((shift) => {
        const candidates = ['a', 'b', 'c', 'd'].map(
          (_c, i, all) => all[(i + shift) % 4]!,
        )
        const ranking = new BottomTwoRunoff({ candidates, ballots }).ranking()
        return JSON.stringify(
          ranking.map((tier) => tier.toSorted((x, y) => x.localeCompare(y))),
        )
      }),
    )
    expect(rankings.size).toBe(1)
  })
})
