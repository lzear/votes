import React from 'react'
import { ListVotesGroup } from './list-votes-group'
import { Typography } from 'antd'
import { Candidates } from './candidates'
import { SelectPremade } from './select-premade'
import { WidthSetter } from './width-setter'
import { EditBallotRank } from './edit-ballot-rank'
import { SelectMethod } from './select-method'
import { Results } from './results'
import { MatrixComp } from './matrix'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  findIconDefinition,
  IconDefinition,
  IconLookup,
  library,
} from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { BallotsComp } from './ballots'

library.add(fas)

const coffeeLookup: IconLookup = { prefix: 'fas', iconName: 'external-link' }
const coffeeIconDefinition: IconDefinition = findIconDefinition(coffeeLookup)

export const Sandbox: React.FC = () => {
  return (
    <div className="container">
      <Typography.Title>A sandbox for ranked voting systems</Typography.Title>
      <p>
        This website showcases some ranked voting systems. Simulate an election
        by adding candidates, and voter preferences. Read more on{' '}
        <a href="https://www.elzear.de/posts/2021-01-10-polls">
          <FontAwesomeIcon icon={coffeeIconDefinition} /> elzear.de
        </a>
        , where polls can also be shared.
      </p>
      <SelectPremade />
      <div className="flex-horiz">
        <Candidates />

        <BallotsComp />
      </div>
      <div className="main">
        <WidthSetter />
        <ListVotesGroup />
        <EditBallotRank />
        <MatrixComp />
        <SelectMethod />
        <Results />
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .main {
          display: flex;
          flex-direction: column;
        }
        .side {
          display: flex;
          flex-direction: column;
        }
        .flex-horiz {
          margin-top: 50px;
          display: flex;
          flex-direction: row;
          gap: 20px;
          flex-wrap: wrap;
        }
        .side {
          flex-direction: column;
        }
      `}</style>
    </div>
  )
}

export default Sandbox