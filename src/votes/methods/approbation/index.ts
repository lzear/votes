import _ from 'lodash'
import { Bulletin, MethodFromRankings, ScoreObject, PollType } from '../../types'

const approbation: MethodFromRankings = {
  type: PollType.Approbation,
  computeScoresFromRankings(candidateIds: string[], bulletins: Bulletin[]): ScoreObject {
    const result: ScoreObject = _.zipObject(candidateIds, new Array(candidateIds.length).fill(0))
    bulletins.forEach(bulletin => {
      if (bulletin.length) {
        const votes = bulletin[0].filter(cId => candidateIds.includes(cId))
        votes.forEach((v, k, a) => {
          result[v] += 1
        })
      }
    })
    return result
  }
}

export default approbation
