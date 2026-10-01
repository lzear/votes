import { tb } from '../../classes/round-ballot-method-tb'
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
    expect(bo.computeRounds()).toMatchInlineSnapshot(`
      [
        {
          "candidates": [
            "😡",
            "🤡",
            "🤥",
            "🔏",
            "🎽",
          ],
          "finished": false,
          "idx": 0,
          "roundResult": {
            "eliminated": [
              "🔏",
            ],
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
                "input": [
                  "🤥",
                  "🔏",
                ],
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
                "tbIndex": 0,
                "tbName": "FirstPastThePost",
              },
            ],
          },
        },
        {
          "candidates": [
            "😡",
            "🤡",
            "🎽",
            "🤥",
          ],
          "finished": false,
          "idx": 1,
          "roundResult": {
            "eliminated": [
              "🤥",
            ],
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
                "input": [
                  "🤥",
                  "🤡",
                ],
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
                "tbIndex": 0,
                "tbName": "FirstPastThePost",
              },
            ],
          },
        },
        {
          "candidates": [
            "😡",
            "🎽",
            "🤡",
          ],
          "finished": false,
          "idx": 2,
          "roundResult": {
            "eliminated": [
              "🤡",
            ],
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
                "input": [
                  "🤡",
                  "🎽",
                ],
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
                "tbIndex": 0,
                "tbName": "FirstPastThePost",
              },
            ],
          },
        },
        {
          "candidates": [
            "😡",
            "🎽",
          ],
          "finished": true,
          "idx": 3,
          "roundResult": {
            "eliminated": [
              "🎽",
            ],
            "qualified": [
              "😡",
            ],
            "scores": {
              "🎽": 0,
              "😡": 3,
            },
            "tieBreakSteps": [
              {
                "input": [
                  "🎽",
                  "😡",
                ],
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
                "tbIndex": 0,
                "tbName": "FirstPastThePost",
              },
            ],
          },
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
      b2r
        .computeRounds()[0]
        ?.roundResult.tieBreakSteps?.map(({ tbName }) => tbName),
    ).toStrictEqual(['FirstPastThePost', 'RandomCandidates'])
    const restricted = b2r.restrict(['a', 'b', 'c']) as typeof b2r
    expect(restricted.computeRounds()).toStrictEqual(b2r.computeRounds())
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
