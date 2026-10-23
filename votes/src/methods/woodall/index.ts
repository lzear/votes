import { findSmithSet } from '../../utils'
import { InstantRunoffHybrid } from '../instant-runoff/hybrid'

/**
Instant runoff until one member of the Smith set is left, who wins.

#### Electowiki: [Woodall's method](https://electowiki.org/wiki/Woodall%27s_method)
*/
export class Woodall<C extends string> extends InstantRunoffHybrid<C> {
  public static readonly label = 'Woodall'

  private smith?: ReadonlySet<C>

  protected kept(race: readonly C[]): readonly C[] {
    this.smith ??= new Set(findSmithSet(this.matrix).candidates)
    const left = race.filter((c) => this.smith?.has(c))
    return left.length === 1 ? left : race
  }
}
