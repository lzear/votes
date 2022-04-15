import { BiggestSupport } from '.'

describe(BiggestSupport, function () {
  it('works with standard example', () => {
    const bs = new BiggestSupport({
      ballots: [
        {
          ranking: [['😡'], ['🎽'], ['🤡'], ['🤥'], ['🔏']],
          weight: 2,
        },
        {
          ranking: [['😡'], ['🤡'], ['🎽'], ['🤥'], ['🔏']],
          weight: 1,
        },
      ],
      candidates: ['😡', '🤡', '🤥', '🔏', '🎽'],
    })

    expect(bs.ranking()).toStrictEqual([['😡'], ['🎽'], ['🤡'], ['🤥'], ['🔏']])
  })
})
