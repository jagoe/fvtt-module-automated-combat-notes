import { COMBAT_NOTE_STORAGE_TYPE, ERROR, MODULE_ID } from '../constants'
import { CombatNote, CombatNoteData } from '../models'
import { getNoteFromStorageData } from './combatNoteMapper'

export async function saveNotes(notes: CombatNoteData[]) {
  const _game = game as Game

  if (!_game.user) {
    ui.notifications?.error(ERROR.MissingUser, { localize: true, permanent: true })
    return
  }

  await _game.user.setFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE, notes)
}

export async function loadNotes(): Promise<CombatNote[]> {
  const _game = game as Game

  const storedNoteData = (_game.user?.getFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE) as CombatNoteData[]) ?? []
  const noteResults = await Promise.all(
    storedNoteData.map(async (data) => ({ ...(await getNoteFromStorageData(data)), data })),
  )

  const notes = noteResults
    // We ignore errors and empty notes because they shouldn't have been stored anyway
    .filter((result) => !!result.note)
    .map((result) => ({ ...result.note!, frequency: result.data.frequency }))

  return notes
}
