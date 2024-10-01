import { JournalOpener } from './journal-opener'

export class FoundryJournalOpener implements JournalOpener {
  public openJournalEntry(document: JournalEntry | JournalEntryPage, anchor?: string) {
    switch (document.documentName) {
    case 'JournalEntry':
      FoundryJournalOpener.renderJournalEntry(document as JournalEntry)
      break
    case 'JournalEntryPage':
      FoundryJournalOpener.renderJournalEntryPage(document.parent, document.id, anchor)
      break
    default:
      // Invalid document type, so we just ignore it
      return
    }
  }

  private static renderJournalEntry(entry: JournalEntry) {
    entry.sheet?.render(true)
  }

  private static renderJournalEntryPage(entry: JournalEntry, pageId: string | null, slug?: string) {
    // Hacky, but the typing seem to be outdated
    const renderOptions = { pageId, anchor: slug } as unknown as Application.RenderOptions<FormApplicationOptions>

    return entry.sheet?.render(true, renderOptions)
  }
}
