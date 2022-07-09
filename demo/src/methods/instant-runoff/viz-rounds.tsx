import React, { useEffect, useRef, useState } from 'react'
import type { Ballot, Round } from 'votes'
import { utils } from 'votes'
import numeral from 'numeral'
import { Candidate } from '../../generate-ballots'
import {
  selectBallots,
  useCandidatesById,
  useCandidatesString,
} from '../../store/selectors'
import { useStore } from '../../store'
import { CandiTagList } from '../../candidates'
import { Button, Typography } from 'antd'
import { BallotWithId, StoreBallots } from '../../ballot-with-id'
import _ from 'lodash'
import { QuickScores } from '../viz/quick-scores'
import { useElementWidth } from '../../width-setter'

type RR<B extends Ballot> = Round & {
  eliminated: string[]
  ballotsInRound: B[]
}

export const computeRoundResult: <B extends Ballot>({
  candidatesStrings,
  round,
  ballots,
}: {
  candidatesStrings: string[]
  ballots: B[]
  round: Round
}) => RR<B> = <B extends Ballot>({
  candidatesStrings,
  round,
  ballots,
}: {
  candidatesStrings: string[]
  ballots: B[]
  round: Round
}) => {
  const eliminated = _.difference(candidatesStrings, round.candidates)
  const ballotsInRound = ballots.map((b) =>
    utils.normalizeBallot(b, round.candidates),
  )
  return {
    ...round,
    eliminated,
    ballotsInRound,
  }
}

export const RoundsSummary: React.FC<{
  rounds: Round[]
  candidatesById: { [id: string]: Candidate }
}> = ({ rounds, candidatesById }) => {
  const winners = rounds
    .filter((r) => r.roundResult.eliminated.length > 0)
    .at(-1)?.roundResult.eliminated
  return (
    <>
      <Typography.Title level={4}>Summary</Typography.Title>
      <Typography.Title level={5}>
        Winner{winners && winners.length > 1 && 's'}
      </Typography.Title>
      <div className="block">
        {winners && (
          <CandiTagList candidates={winners.map((c) => candidatesById[c])} />
        )}
      </div>
      <Typography.Title level={5}>Iterations</Typography.Title>
      {[...rounds].reverse().map((round, reverseRoundIdx) => {
        const roundIdx = rounds.length - reverseRoundIdx - 1
        if (roundIdx === rounds.length - 1) return null
        return (
          <div key={roundIdx}>
            Eliminated round #{roundIdx + 1}:{' '}
            <CandiTagList
              candidates={round.roundResult.eliminated.map(
                (c) => candidatesById[c],
              )}
            />
          </div>
        )
      })}
      <style jsx>{`
        .block {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  )
}

export const RoundDescription: React.FC<{
  roundR: RR<BallotWithId>
  roundIdx: number

  candidatesById: { [id: string]: Candidate }
}> = ({ roundIdx, roundR, candidatesById }) => {
  const isTie = roundR.roundResult.qualified.length === 0

  const ended = isTie || roundR.roundResult.qualified.length < 2
  const qualified = isTie
    ? roundR.roundResult.eliminated
    : roundR.roundResult.qualified
  return (
    <div className="container">
      <Typography.Title level={4}>Round #{roundIdx + 1}</Typography.Title>
      {roundIdx > 0 && (
        <div>
          Eliminated in previous rounds:{' '}
          <CandiTagList
            candidates={roundR.eliminated.map((c) => candidatesById[c])}
          />
        </div>
      )}
      <div>
        Candidates this round:{' '}
        <CandiTagList
          candidates={roundR.candidates.map((c) => candidatesById[c])}
        />
      </div>
      {!isTie && (
        <div>
          Eliminated this round:{' '}
          <CandiTagList
            candidates={roundR.roundResult.eliminated.map(
              (c) => candidatesById[c],
            )}
          />
        </div>
      )}
      <div>
        {ended ? 'Final winners' : 'Qualified of this round'}
        {isTie ? ' (draw)' : ''}:{' '}
        <CandiTagList candidates={qualified.map((c) => candidatesById[c])} />
      </div>
      <div>
        Scores this round:
        <br />
        <QuickScores
          candidatesById={candidatesById}
          scoreObject={roundR.roundResult.scores}
        />
        {/*<ul>*/}
        {/*  {scores.map((s) => (*/}
        {/*    <li key={s[0]}>*/}
        {/*      {s[0]}: {parseFloat(s[1].toFixed(2))}*/}
        {/*      <br />*/}
        {/*    </li>*/}
        {/*  ))}*/}
        {/*</ul>*/}
      </div>
      <style jsx>{`
        .container {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}

const roundName = (roundIdx: number) =>
  `${numeral(roundIdx + 1).format('0o')} round`

const H_PADDING = 20

export const VizRoundsBallots: React.FC<{
  rounds: Round[]
  displayer: React.FC<{
    ballots: StoreBallots[]
    containerWidth: number
    candidates: string[]
    round?: Round
  }>
}> = ({ rounds, displayer }) => {
  const Displayer = displayer
  const _ballots = useStore(selectBallots)
  const candidatesById = useCandidatesById()
  const candidatesStrings = useCandidatesString()

  const ref = useRef<HTMLDivElement>(null)
  const divWidth = useElementWidth(ref.current)

  useEffect(() => {
    setRoundIdx(0)
  }, [candidatesStrings, _ballots])

  const roundsToShow = rounds.filter((r) => r.candidates.length > 1)

  const [roundIdx, setRoundIdx] = useState(0)
  const round: Round | undefined = roundsToShow[roundIdx]
  const roundResult =
    round && computeRoundResult({ candidatesStrings, ballots: _ballots, round })
  const ballots = roundResult?.ballotsInRound || _ballots

  return (
    <>
      <RoundsSummary rounds={rounds} candidatesById={candidatesById} />
      <div className="container" ref={ref}>
        {roundResult && (
          <RoundDescription
            roundR={roundResult}
            roundIdx={roundIdx}
            candidatesById={candidatesById}
          />
        )}
        {round && divWidth && candidatesStrings.length > 2 && (
          <Displayer
            ballots={ballots}
            containerWidth={divWidth - H_PADDING * 2}
            candidates={round.candidates}
            round={round}
          />
        )}
      </div>
      <div className="buttons">
        {roundIdx > 0 && (
          <Button
            style={{
              flex: '0 0 auto',
            }}
            onClick={() => setRoundIdx((r) => r - 1)}
            disabled={roundIdx <= 0}
          >
            {roundName(roundIdx - 1)}
          </Button>
        )}
        {roundIdx < roundsToShow.length - 1 && (
          <Button
            style={{
              flex: '0 0 auto',
              marginLeft: 'auto',
            }}
            onClick={() => setRoundIdx((r) => r + 1)}
            disabled={roundIdx >= roundsToShow.length - 1}
          >
            {roundName(roundIdx + 1)}
          </Button>
        )}
      </div>
      <style jsx>{`
        .buttons {
          display: flex;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .container {
          margin-top: 20px;
          padding: ${H_PADDING}px 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          box-shadow: rgb(168 172 189 / 27%) 0px 0px 0.25em,
            rgb(67 100 163 / 5%) 0px 0.25em 1em;
          background: rgba(228, 226, 228, 0.04);
          border: solid 1px #333;
        }
      `}</style>
    </>
  )
}

export default VizRoundsBallots
