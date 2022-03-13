import { BottomTwoRunoff } from '.'

describe(BottomTwoRunoff, function () {
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
    expect(bo.computeRounds()).toMatchInlineSnapshot(
      [
        {
          candidates: ['😡', '🤡', '🤥', '🔏', '🎽'],
          finished: false,
          idx: 0,
          roundResult: {
            eliminated: ['🔏'],
            qualified: ['😡', '🤡', '🤥', '🎽'],
            scores: {
              '🎽': 2,
              '🔏': 0,
              '😡': 2,
              '🤡': 2,
              '🤥': 1,
            },
          },
        },

        {
          candidates: ['😡', '🤡', '🤥', '🎽'],
          finished: false,
          idx: 1,
          roundResult: {
            eliminated: ['🤥'],
            qualified: ['😡', '🤡', '🎽'],
            scores: {
              '🎽': 2,
              '😡': 2,
              '🤡': 1,
              '🤥': 0,
            },
          },
        },

        {
          candidates: ['😡', '🤡', '🎽'],
          finished: false,
          idx: 2,
          roundResult: {
            eliminated: ['🤡'],
            qualified: ['😡', '🎽'],
            scores: {
              '🎽': 1,
              '😡': 2,
              '🤡': 0,
            },
          },
        },

        {
          candidates: ['😡', '🎽'],
          finished: false,
          idx: 3,
          roundResult: {
            eliminated: ['🎽'],
            qualified: ['😡'],
            scores: {
              '🎽': 0,
              '😡': 1,
            },
          },
        },

        {
          candidates: ['😡'],
          finished: true,
          idx: 4,
          roundResult: {
            eliminated: ['😡'],
            qualified: [],
            scores: {
              '😡': 0,
            },
          },
        },
      ],
      `
      Array [
        Object {
          "candidates": Array [
            "😡",
            "🤡",
            "🤥",
            "🔏",
            "🎽",
          ],
          "finished": false,
          "idx": 0,
          "roundResult": Object {
            "eliminated": Array [
              "🔏",
            ],
            "qualified": Array [
              "😡",
              "🤡",
              "🤥",
              "🎽",
            ],
            "scores": Object {
              "🎽": 2,
              "🔏": 0,
              "😡": 2,
              "🤡": 2,
              "🤥": 1,
            },
          },
        },
        Object {
          "candidates": Array [
            "😡",
            "🤡",
            "🤥",
            "🎽",
          ],
          "finished": false,
          "idx": 1,
          "roundResult": Object {
            "eliminated": Array [
              "🤥",
            ],
            "qualified": Array [
              "😡",
              "🤡",
              "🎽",
            ],
            "scores": Object {
              "🎽": 2,
              "😡": 2,
              "🤡": 1,
              "🤥": 0,
            },
          },
        },
        Object {
          "candidates": Array [
            "😡",
            "🤡",
            "🎽",
          ],
          "finished": false,
          "idx": 2,
          "roundResult": Object {
            "eliminated": Array [
              "🤡",
            ],
            "qualified": Array [
              "😡",
              "🎽",
            ],
            "scores": Object {
              "🎽": 1,
              "😡": 2,
              "🤡": 0,
            },
          },
        },
        Object {
          "candidates": Array [
            "😡",
            "🎽",
          ],
          "finished": false,
          "idx": 3,
          "roundResult": Object {
            "eliminated": Array [
              "🎽",
            ],
            "qualified": Array [
              "😡",
            ],
            "scores": Object {
              "🎽": 0,
              "😡": 1,
            },
          },
        },
        Object {
          "candidates": Array [
            "😡",
          ],
          "finished": true,
          "idx": 4,
          "roundResult": Object {
            "eliminated": Array [
              "😡",
            ],
            "qualified": Array [],
            "scores": Object {
              "😡": 0,
            },
          },
        },
      ]
    `,
    )
  })
})
