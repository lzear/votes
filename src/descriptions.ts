import { VotingSystem } from './types'

const descriptions: { [type in VotingSystem]: string } = {
  [VotingSystem.FirstPastThePost]: 'Only the preferred candidate of each voter gets 1 point',
  [VotingSystem.Approbation]: 'Each voter gives 1 point to the candidates he or she ranks first',
  [VotingSystem.Borda]:
    'Each voter gives a number of points corresponding to the number of candidates ranked lower in his or her ballot',
  [VotingSystem.Kemeny]:
    'Create a preference ranking that minimizes the amount of pairwise preferences contradiction the voters opinion',
  [VotingSystem.InstantRunoff]:
    "Considering only voter's top choice, the candidate with the fewest votes is eliminated. The election repeats until there is a winner",
  [VotingSystem.TwoRoundRunoff]:
    'Majority vote followed by another majority vote amongst the 2 best ranked candidates',
  [VotingSystem.Schulze]: 'https://en.wikipedia.org/wiki/Schulze_method',
  [VotingSystem.Minimax]:
    'Minimax selects the winner as the candidate whose greatest pairwise defeat is smaller',
}

export default descriptions
