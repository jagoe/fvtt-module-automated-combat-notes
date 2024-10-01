import '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/head'

export {}

declare global {
  interface JournalEntryPage {
    documentName: string
    id: string
    parent: JournalEntry
    sheet: {
      render(force?: boolean, options: { anchor?: string }): void
    }
  }

  interface JournalEntry {
    pages: Map<string, JournalEntryPage> & { contents: JournalEntryPage[] }
  }

  interface Game {
    MonksEnhancedJournal: {
      openJournalEntry(entry: JournalEntry | JournalEntryPage, options: { anchor?: string; newtab?: boolean }): void
      getMEJType(entry: JournalEntry | JournalEntryPage): string | undefined
      fixType(page: JournalEntryPage): void
    }
  }
}
