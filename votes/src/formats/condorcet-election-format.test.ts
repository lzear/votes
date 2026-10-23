import { AbsoluteMajority } from '../methods/absolute-majority'
import {
  parseCondorcetElectionFormat,
  stringifyCondorcetElectionFormat,
} from './condorcet-election-format'

describe('parseCondorcetElectionFormat', () => {
  it('parses candidates from parameters', () => {
    const result = parseCondorcetElectionFormat(
      '#/Candidates: Alice; Bob; Charlie\n#/Implicit Ranking: false\n',
    )
    expect(result.candidates).toEqual(['Alice', 'Bob', 'Charlie'])
    expect(result.ballots).toEqual([])
  })

  it('parses basic ranked votes', () => {
    const input = `#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: false

Alice > Bob > Charlie * 5
Bob = Alice > Charlie * 3
Charlie`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob'], ['Charlie']], weight: 5 },
      { ranking: [['Bob', 'Alice'], ['Charlie']], weight: 3 },
      { ranking: [['Charlie']], weight: 1 },
    ])
  })

  it('applies implicit ranking', () => {
    const input = `#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: true

Alice > Bob * 3`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob'], ['Charlie']], weight: 3 },
    ])
  })

  it('implicit ranking true by default', () => {
    const input = `#/Candidates: Alice; Bob; Charlie

Alice`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob', 'Charlie']], weight: 1 },
    ])
  })

  it('reads /EMPTY_RANKING/ as a blank ballot with implicit ranking', () => {
    const input = `#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: true

/EMPTY_RANKING/ * 2`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([{ ranking: [], weight: 2 }])
  })

  it('ranks alike after a round trip with a blank ballot', () => {
    const input = {
      candidates: ['A', 'B', 'C'],
      ballots: [
        { ranking: [['A'], ['B'], ['C']], weight: 4 },
        { ranking: [['B'], ['C'], ['A']], weight: 3 },
        { ranking: [], weight: 3 },
      ],
    }
    const back = parseCondorcetElectionFormat(
      stringifyCondorcetElectionFormat(input),
    )
    for (const countBlank of [false, true])
      expect(
        new AbsoluteMajority({ ...back, countBlank }).ranking(),
      ).toStrictEqual(new AbsoluteMajority({ ...input, countBlank }).ranking())
  })

  it('handles /EMPTY_RANKING/ without implicit ranking', () => {
    const input = `#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: false

/EMPTY_RANKING/ * 2`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([{ ranking: [], weight: 2 }])
  })

  it('applies weight when allowed', () => {
    const input = `#/Candidates: Alice; Bob
#/Weight Allowed: true

Alice > Bob ^3 * 2`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 6 },
    ])
  })

  it('reads * and ^ without the spaces around them', () => {
    const input = `#/Candidates: Alice; Bob
#/Weight Allowed: true

Alice > Bob ^3 *2
Alice>Bob^3*2`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 6 },
      { ranking: [['Alice'], ['Bob']], weight: 6 },
    ])
  })

  it('ignores weight when not allowed', () => {
    const input = `#/Candidates: Alice; Bob
#/Weight Allowed: false

Alice > Bob ^3 * 2`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 2 },
    ])
  })

  it('supports float quantifier', () => {
    const input = `#/Candidates: Alice; Bob
#/Implicit Ranking: false

Alice > Bob * 2.5`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 2.5 },
    ])
  })

  it('supports float weight when allowed', () => {
    const input = `#/Candidates: Alice; Bob
#/Weight Allowed: true

Alice > Bob ^1.5 * 2`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 3 },
    ])
  })

  it('weight not allowed by default', () => {
    const input = `#/Candidates: Alice; Bob

Alice > Bob ^5`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 1 },
    ])
  })

  it('strips tags', () => {
    const input = `#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: false

tag1, tag2 || Alice > Bob > Charlie`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob'], ['Charlie']], weight: 1 },
    ])
  })

  it('ignores full-line comments', () => {
    const input = `# This is a comment
#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: false
# Another comment

Alice > Bob > Charlie`
    const result = parseCondorcetElectionFormat(input)
    expect(result.candidates).toEqual(['Alice', 'Bob', 'Charlie'])
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob'], ['Charlie']], weight: 1 },
    ])
  })

  it('strips inline comments from vote lines', () => {
    const input = `#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: false

Alice > Bob > Charlie # this voter prefers Alice`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob'], ['Charlie']], weight: 1 },
    ])
  })

  it('filters invalid candidates', () => {
    const input = `#/Candidates: Alice; Bob
#/Implicit Ranking: false

Alice > Bob > Unknown`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 1 },
    ])
  })

  it('removes duplicate candidates within ranking', () => {
    const input = `#/Implicit Ranking: false

Alice > Bob > Alice`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 1 },
    ])
  })

  it('derives candidates from ballots when not in params', () => {
    const input = `#/Implicit Ranking: false

Alice > Bob > Charlie
Bob > Alice > Charlie`
    const result = parseCondorcetElectionFormat(input)
    expect(result.candidates).toContain('Alice')
    expect(result.candidates).toContain('Bob')
    expect(result.candidates).toContain('Charlie')
    expect(result.ballots).toHaveLength(2)
  })

  it('reads parameters after a byte order mark or indent', () => {
    for (const text of [
      '\u{FEFF}#/Candidates: A; B; C\nA > B',
      '  #/Candidates: A; B; C\nA > B',
    ])
      expect(parseCondorcetElectionFormat(text)).toStrictEqual({
        candidates: ['A', 'B', 'C'],
        ballots: [{ ranking: [['A'], ['B'], ['C']], weight: 1 }],
      })
  })

  it('refuses a null byte', () => {
    expect(() =>
      parseCondorcetElectionFormat('#/Candidates: A; B\nA\0 > B'),
    ).toThrow('null byte')
  })

  it('throws on a weight past the largest number', () => {
    expect(() =>
      parseCondorcetElectionFormat('#/Candidates: A; B\nA > B * 1e999'),
    ).toThrow(RangeError)
  })

  it('handles parameter names case-insensitively', () => {
    const input = `#/CANDIDATES: Alice; Bob
#/IMPLICIT RANKING: false

Alice > Bob`
    const result = parseCondorcetElectionFormat(input)
    expect(result.candidates).toEqual(['Alice', 'Bob'])
    expect(result.ballots).toEqual([
      { ranking: [['Alice'], ['Bob']], weight: 1 },
    ])
  })

  it('ignores unknown parameters', () => {
    const input = `#/Candidates: Alice; Bob
#/Number of Seats: 3
#/Voting Methods: Schulze; Ranked Pairs
#/Implicit Ranking: false

Alice > Bob`
    const result = parseCondorcetElectionFormat(input)
    expect(result.candidates).toEqual(['Alice', 'Bob'])
  })
})

describe('stringifyCondorcetElectionFormat', () => {
  it('writes candidates and ballots', () => {
    const result = stringifyCondorcetElectionFormat(
      {
        candidates: ['Alice', 'Bob', 'Charlie'],
        ballots: [{ ranking: [['Alice'], ['Bob'], ['Charlie']], weight: 1 }],
      },
      { implicitRanking: false },
    )
    expect(result).toBe(
      '#/Candidates: Alice; Bob; Charlie\n#/Implicit Ranking: false\n\nAlice > Bob > Charlie',
    )
  })

  it('rejects reserved characters in names', () => {
    for (const name of [
      'A > B',
      'A=B',
      'A; B',
      'A, B',
      'A#',
      'A/B',
      'A*',
      'A^2',
      'A\0',
      'A\nB',
      'A||B',
      ' A',
      'A ',
      '',
    ])
      expect(() =>
        stringifyCondorcetElectionFormat({
          candidates: ['Z'],
          ballots: [{ ranking: [[name]], weight: 1 }],
        }),
      ).toThrow(name)
  })

  it('writes quantifier when weight > 1', () => {
    const result = stringifyCondorcetElectionFormat(
      {
        candidates: ['Alice', 'Bob'],
        ballots: [{ ranking: [['Alice'], ['Bob']], weight: 5 }],
      },
      { implicitRanking: false },
    )
    expect(result).toContain('Alice > Bob * 5')
  })

  it('omits implicit last rank', () => {
    const result = stringifyCondorcetElectionFormat(
      {
        candidates: ['Alice', 'Bob', 'Charlie'],
        ballots: [{ ranking: [['Alice'], ['Bob', 'Charlie']], weight: 1 }],
      },
      { implicitRanking: true },
    )
    expect(result).toContain('Alice')
    expect(result).not.toContain('Bob = Charlie')
  })

  it('keeps last rank when implicitRanking: false', () => {
    const result = stringifyCondorcetElectionFormat(
      {
        candidates: ['Alice', 'Bob', 'Charlie'],
        ballots: [{ ranking: [['Alice'], ['Bob', 'Charlie']], weight: 1 }],
      },
      { implicitRanking: false },
    )
    expect(result).toContain('Alice > Bob = Charlie')
  })

  it('skips empty ranks', () => {
    expect(
      stringifyCondorcetElectionFormat(
        { candidates: ['A', 'B'], ballots: [{ ranking: [['A'], [], ['B']] }] },
        { implicitRanking: false },
      ),
    ).toContain('\nA > B')
  })

  it('writes /EMPTY_RANKING/ for empty ranking', () => {
    const result = stringifyCondorcetElectionFormat(
      {
        candidates: ['Alice', 'Bob'],
        ballots: [{ ranking: [], weight: 2 }],
      },
      { implicitRanking: false },
    )
    expect(result).toContain('/EMPTY_RANKING/ * 2')
  })

  it('round-trips through parse', () => {
    const original = {
      candidates: ['Alice', 'Bob', 'Charlie'],
      ballots: [
        { ranking: [['Alice'], ['Bob'], ['Charlie']], weight: 3 },
        { ranking: [['Bob', 'Alice'], ['Charlie']], weight: 2 },
      ],
    }
    const parsed = parseCondorcetElectionFormat(
      stringifyCondorcetElectionFormat(original, { implicitRanking: false }),
    )
    expect(parsed.candidates).toEqual(original.candidates)
    expect(parsed.ballots).toEqual(original.ballots)
  })

  it('round-trips weights written with an exponent', () => {
    const original = {
      candidates: ['Alice', 'Bob'],
      ballots: [{ ranking: [['Alice'], ['Bob']], weight: 1.5e21 }],
    }
    const parsed = parseCondorcetElectionFormat(
      stringifyCondorcetElectionFormat(original, { implicitRanking: false }),
    )
    expect(parsed.ballots).toEqual(original.ballots)
  })

  it('throws a RangeError on a non-integer weight, naming the ranking', () => {
    const profile = {
      candidates: ['Alice', 'Bob'],
      ballots: [{ ranking: [['Alice'], ['Bob']], weight: 0.5 }],
    }
    expect(() => stringifyCondorcetElectionFormat(profile)).toThrow(RangeError)
    expect(() => stringifyCondorcetElectionFormat(profile)).toThrow(
      /Alice > Bob/,
    )
  })

  it('skips weight-0 ballots', () => {
    const result = stringifyCondorcetElectionFormat(
      {
        candidates: ['Alice', 'Bob'],
        ballots: [
          { ranking: [['Alice'], ['Bob']], weight: 0 },
          { ranking: [['Bob'], ['Alice']], weight: 2 },
        ],
      },
      { implicitRanking: false },
    )
    expect(result).not.toContain('Alice > Bob')
    expect(result).toContain('Bob > Alice * 2')
  })

  it('round-trips integer weights', () => {
    const original = {
      candidates: ['Alice', 'Bob'],
      ballots: [
        { ranking: [['Alice'], ['Bob']], weight: 1 },
        { ranking: [['Bob'], ['Alice']], weight: 7 },
      ],
    }
    const parsed = parseCondorcetElectionFormat(
      stringifyCondorcetElectionFormat(original, { implicitRanking: false }),
    )
    expect(parsed.ballots).toEqual(original.ballots)
  })
})
