import React, { useState } from 'react'
import { useStore } from './store'
import { selectSetPremade } from './store/selectors'
import { Select } from 'antd'
import { balinski } from './premade/balinski'
import type { Ballot } from 'votes'
import { condorcetMess } from './premade/condorcet-mess'
import { badBorda } from './premade/bad-borda'
import { badFptp } from './premade/bad-fptp'
import { badTwoRounds } from './premade/bad-two-rounds'

const premades: {
  [s: string]: {
    candidates: string[]
    ballots: Ballot[]
    name: string
    description: string
  }
} = {
  badBorda,
  badFptp,
  badTwoRounds,
  balinski,
  condorcetMess,
}

export const SelectPremade: React.FC = () => {
  const setPremade = useStore(selectSetPremade)

  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div>
      <label htmlFor="presets">
        Here are some presets created to showcase some specificities of some
        voting systems.
      </label>
      <br />
      <Select<string>
        id="presets"
        size="small"
        style={{ minWidth: 250 }}
        placeholder="Preset"
        onSelect={(v: string) => {
          if (v in premades) {
            const vv = premades[v]
            if (vv) {
              setPremade(vv)
              setSelected(v)
            }
          }
        }}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={Object.keys(premades).map((value) => ({
          label: premades[value].name,
          value,
        }))}
      />
      {selected && (
        <div className="descr">
          <strong>{premades[selected].name}</strong>
          <br />
          {premades[selected].description}
        </div>
      )}
      <style jsx>{`
        .descr {
          margin-top: 10px;
        }
      `}</style>
    </div>
  )
}
