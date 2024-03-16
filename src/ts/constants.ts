import { id } from '../module.json'

export const MODULE_ID = id
export const JOURNAL_ENTRY_TYPE = 'JournalEntry'
export const COMBAT_NOTE_STORAGE_TYPE = 'CombatNotes'

export enum ERRORS {
  MISSING_USER = 'ACN.error.missingUser',
  MISSING_JOURNAL_ENTRY_NAME = 'ACN.error.missingJournalEntryName',
  UNKNOWN_JOURNAL_ENTRY = 'ACN.error.unknownJournalEntry',
  UNKNOWN_JOURNAL_ENTRY_ID = 'ACN.error.unknownJournalEntryId',
}
