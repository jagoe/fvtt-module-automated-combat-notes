import { ModuleData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages.mjs'
import AcnOverview from './apps/overview'
import { CombatNoteLoader } from './services/combatNoteLoader'
import { ModuleEvents } from './services/moduleEvents'
import { Metadata } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { Document } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs'

export interface ACN extends Game.ModuleData<ModuleData> {
  overview: AcnOverview
  loader: CombatNoteLoader
  events: ModuleEvents
}

export type AnyDocument = Document<any, any, Metadata<any>> | null


export * from './models'
