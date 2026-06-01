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

  it('handles /EMPTY_RANKING/ with implicit ranking', () => {
    const input = `#/Candidates: Alice; Bob; Charlie
#/Implicit Ranking: true

/EMPTY_RANKING/ * 2`
    const result = parseCondorcetElectionFormat(input)
    expect(result.ballots).toEqual([
      { ranking: [['Alice', 'Bob', 'Charlie']], weight: 2 },
    ])
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
})
