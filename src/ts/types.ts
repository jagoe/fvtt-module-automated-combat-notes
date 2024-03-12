import { ModuleData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages.mjs'
import AcnOverview from './apps/overview'

export interface ACN extends Game.ModuleData<ModuleData> {
  overview: AcnOverview
}

export * from './models'
