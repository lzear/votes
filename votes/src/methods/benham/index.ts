import { condorcetWinner } from '../../utils'
import { InstantRunoffHybrid } from '../instant-runoff/hybrid'

/**
Instant runoff that stops on a Condorcet winner among the candidates left.

#### Electowiki: [Benham's method](https://electowiki.org/wiki/Benham%27s_method)
*/
export class Benham<C extends string> extends InstantRunoffHybrid<C> {
  public static readonly label = 'Benham'

  protected kept(race: readonly C[]): readonly C[] {
    const winner = condorcetWinner(this.duels(race))
    return winner === undefined ? race : [winner]
  }
}
