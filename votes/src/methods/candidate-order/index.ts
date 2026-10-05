import { Method } from '../../classes/method'
import { type Profile } from '../../types'

/**
 * Ranks the candidates in the order given, regardless of the ballots: a
 * deterministic last resort, like the ballot position or alphabetical order
 * some election laws break ties with.
 */
export class CandidateOrder<C extends string> extends Method<C> {
  constructor(i: Partial<Profile<C>> & { candidates: readonly C[] }) {
    super(i.candidates)
  }

  public ranking(): C[][] {
    return this.candidates.map((c) => [c])
  }

  // Keeps this order, whatever the order of `candidates`.
  restrict(candidates: readonly C[]): this {
    type Ctor = new (i: { candidates: readonly C[] }) => this
    const kept = new Set(candidates)
    return new (this.constructor as Ctor)({
      candidates: this.candidates.filter((c) => kept.has(c)),
    })
  }
}
