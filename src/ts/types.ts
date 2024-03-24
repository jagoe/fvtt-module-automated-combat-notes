import { ModuleData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages.mjs'
import AcnOverview from './apps/overview'
import { CombatNoteLoader } from './services/combatNoteLoader'
import { ModuleEvents } from './services/moduleEvents'

export interface ACN extends Game.ModuleData<ModuleData> {
  overview: AcnOverview
  loader: CombatNoteLoader
  events: ModuleEvents
}

export * from './models'
