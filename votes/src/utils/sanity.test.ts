import { VotingSystem } from '../votes'
import { abcde, dummyProfile, dummyProfile10 } from '../test/testUtils'
import { scoresFromBallots, scoresToRanking } from '.'

describe('sanity check', () => {
  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'empty list and empty candidates %p',
    (system) => {
      expect(scoresToRanking(scoresFromBallots([], [], system))).toStrictEqual(
        [],
      )
    },
  )
  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'empty ballot list %p',
    (system) => {
      expect(
        scoresToRanking(scoresFromBallots([], ['a', 'b', 'c'], system))[0],
      ).toStrictEqual(['a', 'b', 'c'])
    },
  )
  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'empty candidates list %p',
    (system) => {
      expect(
        scoresFromBallots(
          [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
          [],
          system,
        ),
      ).toStrictEqual({})
    },
  )
  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'gets the winner from 1 ballot %p',
    (system) => {
      expect(
        scoresToRanking(
          scoresFromBallots(
            [{ ranking: [['a'], ['b'], ['c']], weight: 1 }],
            ['a', 'b', 'c'],
            system,
          ),
        )[0],
      ).toStrictEqual(['a'])
    },
  )

  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'gets the 2 winners from 1 ballot %p',
    (system) => {
      expect(
        scoresToRanking(
          scoresFromBallots(
            [{ ranking: [['a', 'd'], ['b'], ['c']], weight: 1 }],
            ['a', 'b', 'c', 'd'],
            system,
          ),
        )[0],
      ).toStrictEqual(['a', 'd'])
    },
  )

  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'gets the condorcet cycle %p',
    (system) => {
      expect(
        scoresToRanking(
          scoresFromBallots(
            [
              { ranking: [['a'], ['b'], ['c']], weight: 1 },
              { ranking: [['b'], ['c'], ['a']], weight: 1 },
              { ranking: [['c'], ['a'], ['b']], weight: 1 },
            ],
            ['a', 'b', 'c'],
            system,
          ),
        )[0],
      ).toStrictEqual(['a', 'b', 'c'])
    },
  )
  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'dummyProfile %p',
    (system) => {
      expect(
        scoresToRanking(scoresFromBallots(dummyProfile, abcde, system))[0],
      ).toStrictEqual(['a'])
    },
  )
  it.each(Object.values(VotingSystem) as VotingSystem[])(
    'dummyProfile10 %p',
    (system) => {
      expect(
        scoresToRanking(scoresFromBallots(dummyProfile10, abcde, system))[0],
      ).toStrictEqual(['a'])
    },
  )
})
