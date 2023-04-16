import _ from 'lodash'
import type { Ballot } from 'votes'

import type { WithWeights } from './generate-ballots'
import { totalWeight } from './generate-ballots'

export const serializeRank = (rank: string[]): string =>
  JSON.stringify(rank.sort((a, b) => a.localeCompare(b)))

export const serializeRanking = (ranking: string[][]): string =>
  JSON.stringify(ranking.map((rank) => serializeRank(rank)))

export const withSerializedRanking: <B extends Ballot>(
  ballot: B,
) => B & { serializedRanking: string } = <B extends Ballot>(ballot: B) => ({
  ...ballot,
  serializedRanking: serializeRanking(ballot.ranking),
})

export const mergeBallots = <B extends Ballot>(
  ballots: B[],
): (B & { idx: number })[] => {
  const s = ballots.map((b) => withSerializedRanking(b))

  const grouped = _.groupBy(s, 'serializedRanking')

  return Object.values(grouped).map((ballotsInGroup, idx) => ({
    ...ballotsInGroup[0],
    idx,
    weight: totalWeight(ballotsInGroup),
  }))
}

export const normalizeWeights100 = <B extends Ballot & WithWeights>(
  ballots: B[],
): B[] => {
  const oldBallots: B[] = [...ballots]
  const newBallots = []

  let totOld = totalWeight(oldBallots)
  let newTotalWeight = 0
  while (oldBallots.length > 0 && totOld > 0) {
    const lastOld = oldBallots.pop()
    if (!lastOld) break

    const weight = Math.round(
      (100 - newTotalWeight) * (lastOld.weight / totOld),
    )
    newBallots.unshift({ ...lastOld, weight })
    newTotalWeight += weight
    totOld -= lastOld.weight
  }
  return newBallots
  // const tot = totalWeight(ballots)
  // const ratio = 100 / tot
  //
  // return ballots.map((b) => ({ ...b, weight: b.weight * ratio }))
}
