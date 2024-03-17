import { COMBAT_NOTE_STORAGE_TYPE, ERROR, MODULE_ID } from '../constants'
import { CombatNote, JournalEntryData } from '../models'
import { getNoteFromJournalEntryData, mapNoteToJournalEntryData } from './combatNoteMapper'

export function saveNotes(notes: CombatNote[]) {
  const g = game as Game

  if (!g.user) {
    ui.notifications?.error(ERROR.MissingUser, { localize: true, permanent: true })
    return
  }

  g.user.setFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE, notes.map(mapNoteToJournalEntryData))
}

export async function loadNotes(): Promise<CombatNote[]> {
  const g = game as Game

  const storedNoteData = (g.user?.getFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE) as JournalEntryData[]) ?? []
  const noteResults = await Promise.all(storedNoteData.map((note) => getNoteFromJournalEntryData(note)))

  const notes = noteResults
    // We ignore errors and empty notes because they shouldn't have been stored anyway
    .filter((result) => !!result.note)
    .map((a) => a.note) as CombatNote[]

  return notes
}
