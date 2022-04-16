import { useStore } from './store'
import {
  selectAddRandomBallot,
  selectBallots,
  selectNormalizeWeights100,
} from './store/selectors'
import { totalWeight } from './generate-ballots'
import { Button, Typography } from 'antd'
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'

export const BallotsComp = () => {
  const groupedBallots = useStore(selectBallots)
  const totalW = totalWeight(groupedBallots)

  const addRandomBallot = useStore(selectAddRandomBallot)
  const normalizeWeights100 = useStore(selectNormalizeWeights100)
  return (
    <div className="container">
      <Typography.Title level={4}>{totalW} voters</Typography.Title>

      <p>
        Preferences can be edited by clicking the buttons <EditOutlined />
        <PlusOutlined />
        <MinusOutlined />
        <DeleteOutlined />
      </p>
      <div className="flex-horiz">
        <Button
          size="small"
          onClick={addRandomBallot}
          style={{ marginLeft: 20 }}
        >
          +1 random vote
        </Button>
        <Button
          icon={<ArrowRightOutlined />}
          size="small"
          onClick={normalizeWeights100}
        >
          Normalize to 100
        </Button>
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
