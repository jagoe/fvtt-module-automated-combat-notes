import { COMBAT_NOTE_STORAGE_TYPE, ERROR, MODULE_ID } from '../constants'
import { CombatNote, CombatNoteData } from '../models'
import { getNoteFromStorageData, mapNoteToJournalEntryData } from './combatNoteMapper'

export async function saveNotes(notes: CombatNote[]) {
  const g = game as Game

  if (!g.user) {
    ui.notifications?.error(ERROR.MissingUser, { localize: true, permanent: true })
    return
  }

  await g.user.setFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE, notes.map(mapNoteToJournalEntryData))
}

export async function loadNotes(): Promise<CombatNote[]> {
  const g = game as Game

  const storedNoteData = (g.user?.getFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE) as CombatNoteData[]) ?? []
  const noteResults = await Promise.all(
    storedNoteData.map(async (data) => ({ ...(await getNoteFromStorageData(data)), data })),
  )

  const notes = noteResults
    // We ignore errors and empty notes because they shouldn't have been stored anyway
    .filter((result) => !!result.note)
    .map((result) => ({ ...result.note!, frequency: result.data.frequency }))

  return notes
}
