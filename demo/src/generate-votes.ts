import _ from 'lodash'

import { emojis } from './emojis'

const mergeDraw = <T>(initial: T[][], toAdd: T) => {
  const idx = Math.floor(Math.random() * initial.length)
  if (initial[idx]) initial[idx].push(toAdd)
  else initial[idx] = [toAdd]
}

const mergeNotDraw = <T>(initial: T[][], toAdd: T) => {
  const idx = Math.floor(Math.random() * (initial.length + 1))
  initial.splice(idx, 0, [toAdd])
}

const mergeIn = <T>(a: T[][], b: T[], drawRate: number) => {
  const initial = [...a]
  const toAdd = [...b]
  while (toAdd.length > 0) {
    const element = toAdd.pop()
    if (element === undefined) throw new Error('wtf')
    if (Math.random() <= drawRate) mergeDraw(initial, element)
    else mergeNotDraw(initial, element)
  }
  return initial
}

const updateCandidateList = (desiredLength: number, currentList?: string[]) => {
  const list = currentList || []
  if (list.length > desiredLength) return _.take(currentList, desiredLength)
  if (list.length < desiredLength)
    return [
      ...list,
      ..._.sampleSize(_.difference(emojis, list), desiredLength - list.length),
    ]
  return list
}

export const updateCandidatesAndVotes = (
  countVoters: number,
  countCandidates: number,
  oldVotes: string[][][],
  oldCandidates: string[],
  drawRate: number,
): {
  changed: boolean
  votes: string[][][]
  candidates: string[]
} => {
  const candidates = updateCandidateList(countCandidates, oldCandidates)

  let votes = oldVotes || []

  let changed = candidates.length !== oldCandidates.length
  if (votes.length > countVoters) {
    votes = _.take(votes, countVoters)
    changed = true
  } else if (votes.length < countVoters) {
    const votesToAdd = _.range(countVoters - votes.length)
    votes = [...votes, ...votesToAdd.map(() => [])]
    changed = true
  }

  if (votes.some((pref) => pref.flat().length !== candidates.length)) {
    votes = votes.map((pref) => {
      const prefsToChange = pref
        .map((r) => r.filter((v) => candidates.includes(v)))
        .filter((r) => r.length)
      const toAdd = _.difference(candidates, prefsToChange.flat())
      return mergeIn(prefsToChange, toAdd, drawRate)
    })
    changed = true
  }

  return changed
    ? { votes, candidates, changed }
    : { votes: oldVotes, candidates: oldCandidates, changed }
}
