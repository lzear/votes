import { VotingSystem } from './types'

const descriptions: { [type in VotingSystem]: string } = {
  [VotingSystem.Majority]:
    'Each voter share his vote between the candidates that he or she ranked first.',
  [VotingSystem.Approbation]: 'Each voter gives 1 point to the candidates he or she ranks first',
  [VotingSystem.Borda]:
    'Each voter gives a number of points corresponding to the number of candidates ranked lower in his or her ballot',
  [VotingSystem.Kemeny]:
    'Create a preference ranking that minimizes the amount of pairwise preferences contradiction the voters opinion',
  [VotingSystem.Runoff]:
    'Majority vote followed by another majority vote amongst the 2 best ranked candidates'
}

export default descriptions
