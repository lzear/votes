import create, { GetState, SetState } from 'zustand'
import {
  StoreApiWithSubscribeWithSelector,
  subscribeWithSelector,
} from 'zustand/middleware'
import { StoreBallots } from '../ballot-with-id'
import {
  initBallots,
  randomBallot,
  syncBallotCandidates,
  updateCandidateList,
} from '../generate-ballots'
import { Ballot } from 'votes'
import { randomString } from '../random-string'
import {
  mergeBallots as mergeBallotsUtil,
  normalizeWeights100 as normalizeWeights100util,
} from '../ballot-utils'

export enum DemoSystems {
  // Approbation = 'APPROBATION',
  // AbsoluteMajority = 'ABSOLUTE_MAJORITY',
  Baldwin = 'BALDWIN',
  Borda = 'BORDA',
  BottomTwoRunoff = 'BOTTOM_TWO_RUNOFF',
  Coombs = 'COOMBS',
  Copeland = 'COPELAND',
  FirstPastThePost = 'FIRST_PAST_THE_POST',
  // Kemeny = 'KEMENY',
  InstantRunoff = 'INSTANT_RUNOFF',
  // MaximalLotteries = 'MAXIMAL_LOTTERIES',
  // Minimax = 'MINIMAX',
  Nanson = 'NANSON',
  // RandomizedCondorcet = 'RANDOMIZED_CONDORCET',
  // RandomCandidates = 'RANDOM_CANDIDATES',
  // RandomDictator = 'RANDOM_DICTATOR',
  // RankedPairs = 'RANKED_PAIRS',
  // Schulze = 'SCHULZE',
  TwoRoundRunoff = 'TWO_ROUND_RUNOFF',
}

export type Store = {
  method: DemoSystems
  setMethod: (method: DemoSystems) => void
  candidates: string[]
  highlightedCandidates: { [candidate: string]: boolean } | undefined
  setHighlightedCandidates: (v?: string[]) => void
  ballots: StoreBallots[]
  width: number | null
  setWidth: (v: number) => void
  drawRate: number
  setDrawRate: (drawRate: number) => void
  addRandomBallot: () => void
  mergeBallots: () => void
  normalizeWeights100: () => void
  addCandidate: (c: string) => void
  removeCandidate: (c: string) => void
  updateCandidateCount: (c: number) => void
  setPremade: (v: { candidates: string[]; ballots: Ballot[] }) => void
  changeBallotWeight: (diff: number) => (id: string) => void
  changeBallotRanking: (id: string, ranking: string[][]) => void
  selectBallot: (id: string | null) => void
  selectedBallotId: string | null
}

const initedC = [
  '😡',
  '🤡',
  '🤥',
  // '👻',
  // '🤖',
  // '💩',
  // '🙈',
  // '🙉',
  // '🙊',
  // '👸',
  // '👸🏻',
  // '👸🏼',
  // '💆',
  // '👯',
  // '🐵',
  // '🐒',
]

const initDrawRate = 0

export const useStore = create<
  Store,
  SetState<Store>,
  GetState<Store>,
  StoreApiWithSubscribeWithSelector<Store>
>(
  subscribeWithSelector((set): Store => {
    const updateCandidateCount = (desiredLength: number) =>
      set(({ ballots, candidates, drawRate }) => {
        const newCandidates = updateCandidateList(desiredLength, candidates)
        return {
          candidates: newCandidates,
          ballots: syncBallotCandidates(ballots, newCandidates, drawRate),
        }
      })

    const addCandidate = (newCandidate: string) => {
      set(({ ballots, candidates, drawRate }) => {
        if (!candidates.includes(newCandidate)) {
          const newCandidates = [...candidates, newCandidate]
          return {
            candidates: newCandidates,
            ballots: syncBallotCandidates(ballots, newCandidates, drawRate),
          }
        }
        return { candidates, ballots }
      })
    }

    const changeBallotWeight = (diff: number) => (id: string) => {
      set(({ ballots }) => ({
        ballots: ballots
          .map((ballot) =>
            ballot.id !== id
              ? ballot
              : { ...ballot, weight: ballot.weight + diff },
          )
          .filter((ballot) => ballot.weight > 0)
          .map((b, idx) => ({ ...b, idx })),
      }))
    }
    const changeBallotRanking = (id: string, ranking: string[][]) => {
      set(({ ballots }) => ({
        ballots: mergeBallotsUtil(
          ballots.map((ballot) =>
            ballot.id !== id ? ballot : { ...ballot, ranking },
          ),
        ),
      }))
    }

    const removeCandidate = (candidateToRemove: string) => {
      set(({ ballots, candidates, drawRate }) => {
        const newCandidates = candidates.filter((c) => candidateToRemove !== c)
        return {
          candidates: newCandidates,
          ballots: mergeBallotsUtil(
            syncBallotCandidates(ballots, newCandidates, drawRate),
          ),
        }
      })
    }

    const setPremade = (v: { candidates: string[]; ballots: Ballot[] }) => {
      set({
        candidates: v.candidates,
        ballots: v.ballots.map((b, idx) => ({
          ...b,
          id: randomString(),
          idx,
        })),
      })
    }

    const mergeBallots = () =>
      set(({ ballots }) => ({ ballots: mergeBallotsUtil(ballots) }))

    const normalizeWeights100 = () =>
      set(({ ballots }) => ({ ballots: normalizeWeights100util(ballots) }))

    return {
      method: DemoSystems.Borda,
      setMethod: (method) => set({ method }),
      candidates: initedC,
      ballots: mergeBallotsUtil(initBallots(4, initedC, initDrawRate)),
      drawRate: initDrawRate,
      setDrawRate: (drawRate: number) => set({ drawRate }),
      addRandomBallot: () =>
        set(({ ballots, candidates, drawRate }) => ({
          ballots: mergeBallotsUtil([
            ...ballots,
            { ...randomBallot(candidates, drawRate) },
          ]),
        })),
      updateCandidateCount,
      removeCandidate,
      addCandidate,
      mergeBallots,
      normalizeWeights100,
      changeBallotWeight,
      setPremade,
      setWidth: (width: number) => set({ width }),
      width: null,
      selectedBallotId: null,
      changeBallotRanking,
      selectBallot: (selectedBallotId: string | null) =>
        set({ selectedBallotId }),

      highlightedCandidates: undefined,
      setHighlightedCandidates: (highlightedCandidates?: string[]) =>
        set({
          highlightedCandidates: highlightedCandidates?.reduce(
            (acc, candidate) => {
              acc[candidate] = true
              return acc
            },
            {} as { [candidate: string]: boolean },
          ),
        }),
    }
  }),
)
