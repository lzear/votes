import { ArrowRight, Delete, Edit, Minus, Plus } from 'lucide-react'

import {
  selectAddRandomBallot,
  selectBallots,
  selectNormalizeWeights100,
} from './store/selectors'
import { totalWeight } from './generate-ballots'
import { useStore } from './store'

export const BallotsComp = () => {
  const groupedBallots = useStore(selectBallots)
  const totalW = totalWeight(groupedBallots)

  const addRandomBallot = useStore(selectAddRandomBallot)
  const normalizeWeights100 = useStore(selectNormalizeWeights100)
  return (
    <div className="container">
      <h1 level={4}>{totalW} voters</h1>

      <p>
        Preferences can be edited by clicking the buttons <Edit />
        <Plus />
        <Minus />
        <Delete />
      </p>
      <div className="flex-horiz">
        <button
          size="small"
          onClick={addRandomBallot}
          style={{ marginLeft: 20 }}
        >
          +1 random vote
        </button>
        <button
          icon={<ArrowRight />}
          size="small"
          onClick={normalizeWeights100}
        >
          Normalize to 100
        </button>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          align-items: baseline;
          flex: 1 1 0px;
        }

        .flex-horiz {
          display: flex;
          flex-direction: row;

          justify-content: center;
          align-items: center;
          flex-wrap: wrap;

          gap: 10px;
        }
      `}</style>
    </div>
  )
}
