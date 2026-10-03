import { condorcetMess } from '../../test/condorcet-mess'
import { Coombs } from './index'

describe(Coombs, () => {
  it('treats unranked candidates as tied-last', () => {
    // Voter 2 only ranks 4 of 7 candidates; pilz/pantry/burrito must count as
    // last-place for voter 2, otherwise they never get eliminated and pilz wins by default
    const coombs = new Coombs({
      candidates: [
        'sucre sel',
        'U8 haus',
        'pilz',
        'hummus',
        'maison',
        'pantry',
        'burrito',
      ],
      ballots: [
        {
          ranking: [
            ['sucre sel'],
            ['U8 haus'],
            ['pilz'],
            ['hummus'],
            ['maison'],
            ['pantry'],
            ['burrito'],
          ],
          weight: 1,
        },
        {
          ranking: [['hummus'], ['sucre sel'], ['U8 haus'], ['maison']],
          weight: 1,
        },
      ],
    })
    expect(coombs.ranking()[0]).not.toContain('pilz')
    expect(coombs.ranking()[0]).toContain('sucre sel')
  })

  it('takes no last choice from a partial ballot with unrankedLast: false', () => {
    const coombs = new Coombs({
      candidates: ['A', 'B', 'C'],
      ballots: [
        { ranking: [['A']], weight: 3 },
        { ranking: [['B'], ['A'], ['C']], weight: 2 },
        { ranking: [['C'], ['A'], ['B']], weight: 2 },
      ],
      unrankedLast: false,
    })
    expect(coombs.rounds()[0]?.roundResult.scores).toStrictEqual({
      A: -0,
      B: -2,
      C: -2,
    })
    expect(coombs.ranking()).toStrictEqual([['A'], ['B', 'C']])
  })

  it('works with the complex test', () => {
    const coombs = new Coombs(condorcetMess)

    expect(coombs.ranking()).toMatchInlineSnapshot(`
      [
        [
          "🐭",
        ],
        [
          "🦁",
          "🐸",
          "🐷",
        ],
        [
          "🐻",
        ],
      ]
    `)
    expect(coombs.rounds()).toMatchInlineSnapshot(`
      [
        {
          "candidates": [
            "🐸",
            "🐷",
            "🦁",
            "🐻",
            "🐭",
          ],
          "finished": false,
          "idx": 0,
          "roundResult": {
            "eliminated": [
              "🐻",
            ],
            "info": {
              "resolution": "elimination",
            },
            "qualified": [
              "🦁",
              "🐸",
              "🐷",
              "🐭",
            ],
            "scores": {
              "🐭": -14.5,
              "🐷": -14.5,
              "🐸": -12,
              "🐻": -24,
              "🦁": -3,
            },
          },
        },
        {
          "candidates": [
            "🦁",
            "🐸",
            "🐷",
            "🐭",
          ],
          "finished": true,
          "idx": 1,
          "roundResult": {
            "eliminated": [
              "🦁",
              "🐸",
              "🐷",
            ],
            "info": {
              "resolution": "majority",
            },
            "qualified": [
              "🐭",
            ],
            "scores": {
              "🐭": 35.5,
              "🐷": 16.5,
              "🐸": 5,
              "🦁": 11,
            },
          },
        },
      ]
    `)
  })
})
