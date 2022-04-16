import React from 'react'
import { VotingSystem } from 'votes/src'
import { SystemCriteria } from './descriptions'

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
