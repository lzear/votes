import type React from 'react'
import type { VotingSystem } from 'votes'

import type { SystemCriteria } from './descriptions'

export interface MethodElements {
  id: VotingSystem
  data: {
    name: string
    description: React.ReactNode
    criteria: SystemCriteria
    aliases?: string[]
  }
  Visualisation: React.FC
}
