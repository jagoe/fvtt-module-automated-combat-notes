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

export function loadNotes(): CombatNote[] {
  const g = game as Game

  const storedNotes = (g.user?.getFlag(MODULE_ID, COMBAT_NOTE_STORAGE_TYPE) as JournalEntryData[]) ?? []

  const notes = storedNotes
    .map((note) => getNoteFromJournalEntryData(note).note)
    // We ignore errors and empty notes because they shouldn't have been stored anyway
    .filter((note) => !!note) as CombatNote[]

  return notes
}
