import { COMBAT_NOTE_STORAGE_TYPE, MODULE_ID } from '../../constants'
import { CombatNoteData } from '../../models'

export function loadNoteData() {
  const _game = game as Game
  return (_game.user?.getFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE) as CombatNoteData[]) ?? []
}
