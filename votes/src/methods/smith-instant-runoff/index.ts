import { findSmithSet } from '../../utils'
import { InstantRunoffHybrid } from '../instant-runoff/hybrid'

/**
Instant runoff among the Smith set: the first round puts everyone else out.

#### Electowiki: [Smith//IRV](https://electowiki.org/wiki/Smith//IRV)
*/
export class SmithInstantRunoff<
  C extends string,
> extends InstantRunoffHybrid<C> {
  public static readonly label = 'SmithInstantRunoff'

  private smith?: ReadonlySet<C>

  /**
  @internal
  */
  protected kept(race: readonly C[]): readonly C[] {
    this.smith ??= new Set(findSmithSet(this.matrix).candidates)
    return race.filter((c) => this.smith?.has(c))
  }
}
