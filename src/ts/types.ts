import type { BaseModule } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages/_module.mjs'
import AcnOverview from './apps/overview'
import { CombatNoteLoader } from './services/combatNoteLoader'
import { ModuleEvents } from './services/moduleSocket'

export interface ACN extends BaseModule {
  overview: AcnOverview
  loader: CombatNoteLoader
  socket: ModuleEvents
}

export * from './models'
