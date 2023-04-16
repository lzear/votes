import { Coombs } from './index'
import { condorcetMess } from '../../test/condorcet-mess'

describe(Coombs, () => {
  it('works with the complex test', () => {
    const coombs = new Coombs(condorcetMess)

    expect(coombs.ranking()).toMatchInlineSnapshot(`
      [
        [
          "🐭",
        ],
        [
          "🐸",
          "🐷",
          "🦁",
        ],
        [
          "🐻",
        ],
      ]
    `)
    expect(coombs.computeRounds()).toMatchInlineSnapshot(`
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
            "qualified": [
              "🐸",
              "🐷",
              "🦁",
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
            "🐸",
            "🐷",
            "🦁",
            "🐭",
          ],
          "finished": false,
          "idx": 1,
          "roundResult": {
            "absoluteMajority": true,
            "eliminated": [
              "🐸",
              "🐷",
              "🦁",
            ],
            "qualified": [
              "🐭",
            ],
            "scores": {
              "🐭": 35.5,
              "🐷": 0,
              "🐸": 0,
              "🦁": 0,
            },
          },
        },
        {
          "candidates": [
            "🐭",
          ],
          "finished": true,
          "idx": 2,
          "roundResult": {
            "eliminated": [
              "🐭",
            ],
            "qualified": [],
            "scores": {
              "🐭": 0,
            },
          },
        },
      ]
    `)
  })
})
