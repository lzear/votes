import { VotingSystem } from './types'

const descriptions: { [type in VotingSystem]: string } = {
  [VotingSystem.Approbation]:
    'Each voter gives 1 point to the candidates he or she ranks first',
  [VotingSystem.Borda]:
    'Each voter gives a number of points corresponding to the number of candidates ranked lower in his or her ballot',
  [VotingSystem.Copeland]:
    'Order candidates by the number of pairwise victories',
  [VotingSystem.FirstPastThePost]:
    'Only the preferred candidate of each voter gets 1 point',
  [VotingSystem.InstantRunoff]:
    "Considering only voter's top choice, the candidate with the fewest votes is eliminated. The election repeats until there is a winner",
  [VotingSystem.Kemeny]:
    'Create a preference ranking that minimizes the amount of pairwise preferences contradiction the voters opinion',
  [VotingSystem.Minimax]:
    'Minimax selects the winner as the candidate whose greatest pairwise defeat is smaller',
  [VotingSystem.RankedPairs]: 'https://en.wikipedia.org/wiki/Ranked_pairs',
  [VotingSystem.Schulze]: 'https://en.wikipedia.org/wiki/Schulze_method',
  [VotingSystem.TwoRoundRunoff]:
    'Majority vote followed by another majority vote amongst the 2 best ranked candidates',
}

export default descriptions
