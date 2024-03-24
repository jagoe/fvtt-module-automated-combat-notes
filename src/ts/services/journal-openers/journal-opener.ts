import { FoundryJournalOpener } from './foundry-journal-opener'
import { MonksEnhancedJournalOpener } from './monks-enhanced-journal-opener'

export interface JournalOpener {
  openJournalEntry(document: JournalEntry | JournalEntryPage, anchor?: string): void
}

export function getJournalOpener(): JournalOpener {
  if (MonksEnhancedJournalOpener.isActive()) {
    return new MonksEnhancedJournalOpener()
  }

  return new FoundryJournalOpener()
}
