import type { Ballot, Round } from 'votes'

import type { BallotWithId } from './ballot-with-id'
import { totalWeight } from './generate-ballots'
import type { Scale } from './scale'

export type WithOffset = Ballot & {
  offset: number
  relativeWeight: number
  ballotIdx: number
}

export type BoxMeta = {
  id: string
  key: string
  ballotId: string
  // ballotIdx: number
  rankIdx: number
  cIdx: number
  weight: number
  rankSize: number
  candidate: string
  // fill: string
  // relativeWeight: number
}

export type BoxPosition = {
  // offset: number
  x: number
  y: number
  width: number
  height: number
}

export const withOffset = <B extends Ballot>(ballots: B[]) => {
  const allWeights = totalWeight(ballots)
  return ballots.reduce(
    (acc, ballot, idx) => [
      ...acc,
      {
        ...ballot,
        relativeWeight: ballot.weight / allWeights,
        offset:
          idx === 0
            ? 0
            : acc[idx - 1].offset + acc[idx - 1].weight / allWeights,
        ballotIdx: idx,
      },
    ],
    [] as (B & WithOffset)[],
  )
}

export type WithColor = { fill: string }

export const idToBidNCandidate = (id: string) => {
  const i = id.indexOf('/')
  const [ballotId, candidate] = [id.slice(0, i), id.slice(i + 1)]
  return { ballotId, candidate }
}

export type BoxBase = {
  id: string
  key: string
  ballotId: string
  ballotIdx: number
  rankIdx: number
  cIdx: number
  weight: number
  rankSize: number
  candidate: string
  offset: number
  relativeWeight: number
}

export const toBoxes = (ballots: BallotWithId[]): BoxBase[] =>
  withOffset(ballots).flatMap((b, ballotIdx) =>
    b.ranking.flatMap((rank, rankIdx) =>
      rank.map((candidate, cIdx) => {
        const box: BoxBase = {
          id: `${b.id}/${candidate}`,
          key: `${b.id}/${candidate}`,
          // fill: colors[candidate],
          ballotId: b.id,
          ballotIdx,
          rankIdx,
          cIdx,
          rankSize: rank.length,
          candidate,
          offset: b.offset,
          relativeWeight: b.relativeWeight,
          weight: b.weight,
        }
        return box
      }),
    ),
  )

export const withColor = <B extends { candidate: string }>(
  boxes: B[],
  colors: { [candidate: string]: string },
) => boxes.map((b) => ({ ...b, fill: colors[b.candidate] }))

export const withBallotX = <B extends BoxBase>(boxes: B[], scale: Scale) =>
  boxes.map((b) => ({
    ...b,
    x:
      scale[b.ballotId].offset +
      (scale[b.ballotId].width * b.cIdx) / b.rankSize,
    width: scale[b.ballotId].width / b.rankSize,
  }))
export const withQualified = <B extends BoxBase>(
  boxes: B[],
  round: Round,
): (B & { qualified: boolean })[] => {
  const qualified: { [c: string]: true } = {}
  for (const q of round.roundResult.qualified) {
    qualified[q] = true
  }
  return boxes.map((b) => ({
    ...b,
    qualified: qualified[b.candidate],
  }))
}

export const scale2 = ({
  ballots,
  containerWidth,
  paddingInner,
}: {
  ballots: BallotWithId[]
  containerWidth: number
  paddingInner: number
}) => {
  const totalWe = totalWeight(ballots)
  const cols: {
    [ballotId: string]: {
      offset: number
      width: number
    }
  } = {}
  const gutter =
    ballots.length > 1
      ? (containerWidth * paddingInner) / (ballots.length - 1)
      : 0
  let offset = 0
  const step = (containerWidth + gutter) / totalWe - gutter
  for (const ballot of ballots) {
    const width = step * ballot.weight
    cols[ballot.id] = {
      offset,
      width,
    }
    offset += gutter + width
  }
  return cols
}
