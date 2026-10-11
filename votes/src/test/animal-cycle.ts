import type { Ballot } from '../types'

type Animal = '🐸' | '🐷' | '🦁' | '🐻' | '🐭'

// lzear.org's slides: 58 voters with ties, every animal in the top cycle.
const ballots: Ballot<Animal>[] = [
  { weight: 12, ranking: [['🐸'], ['🐷'], ['🐭'], ['🦁', '🐻']] },
  { weight: 10, ranking: [['🐭'], ['🐸', '🦁', '🐻'], ['🐷']] },
  { weight: 7, ranking: [['🦁'], ['🐻'], ['🐷'], ['🐭'], ['🐸']] },
  { weight: 6, ranking: [['🐷'], ['🦁'], ['🐻', '🐭'], ['🐸']] },
  { weight: 4, ranking: [['🐻', '🐭'], ['🐸'], ['🐷'], ['🦁']] },
  { weight: 4, ranking: [['🐷'], ['🐭'], ['🐸', '🦁', '🐻']] },
  { weight: 4, ranking: [['🐸', '🦁', '🐻'], ['🐷'], ['🐭']] },
  { weight: 3, ranking: [['🐻'], ['🐸', '🦁'], ['🐷'], ['🐭']] },
  { weight: 3, ranking: [['🐻', '🐭'], ['🐸', '🦁'], ['🐷']] },
  { weight: 2, ranking: [['🦁'], ['🐷', '🐻', '🐭'], ['🐸']] },
  { weight: 1, ranking: [['🦁'], ['🐷'], ['🐻', '🐭'], ['🐸']] },
  { weight: 1, ranking: [['🐸'], ['🦁'], ['🐷', '🐻', '🐭']] },
  { weight: 1, ranking: [['🐷', '🐻', '🐭'], ['🐸'], ['🦁']] },
]

export const animalCycle = {
  ballots,
  candidates: ['🐸', '🐷', '🦁', '🐻', '🐭'] as Animal[],
}
