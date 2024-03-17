import { id } from '../module.json'

export const MODULE_ID = id
export const COMBAT_NOTE_STORAGE_TYPE = 'CombatNotes'
export const VALID_DOCUMENT_TYPES = ['JournalEntry', 'JournalEntryPage']

export enum ERROR {
  MissingUser = 'ACN.error.missingUser',
  MissingJournalEntryName = 'ACN.error.missingJournalEntryName',
  UnknownJournalEntry = 'ACN.error.unknownJournalEntry',
  UnknownJournalEntryId = 'ACN.error.unknownJournalEntryId',
  DuplicateJournalEntry = 'ACN.error.duplicateJournalEntry',
}

export enum MODULE_EVENT {
  DisplayNotes = 'DisplayNotes',
}
