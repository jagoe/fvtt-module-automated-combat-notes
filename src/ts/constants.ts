import { id } from '../module.json'

export const MODULE_ID = id
export const JOURNAL_ENTRY_TYPE = 'JournalEntry'
export const COMBAT_NOTE_STORAGE_TYPE = 'CombatNotes'

export enum ERROR {
  MissingUser = 'ACN.error.missingUser',
  MissingJournalEntryName = 'ACN.error.missingJournalEntryName',
  UnknownJournalEntry = 'ACN.error.unknownJournalEntry',
  UnknownJournalEntryId = 'ACN.error.unknownJournalEntryId',
}

export enum MODULE_EVENT {
  DisplayNotes = 'DisplayNotes',
}
