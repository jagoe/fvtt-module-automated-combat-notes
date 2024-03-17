import { mapNoteToDocument } from './combatNoteMapper'
import { loadNotes } from './storage'

export class CombatNoteLoader {
  public async displayNotes() {
    const g = game as Game
    const notes = await loadNotes()

    const mapResults = await Promise.all(notes.map(mapNoteToDocument))

    const errors = mapResults.filter((result) => result.error !== undefined)
    errors.forEach(({ uuid, error }) => ui.notifications?.error(g.i18n.format(error!, { uuid }), { permanent: true }))

    const entries = mapResults.filter((result) => result.document !== undefined).map((result) => result.document)
    entries.forEach((document) => {
      if (!document) {
        return
      }

      const documentName = document.documentName as string | null | undefined

      switch (documentName) {
        case 'JournalEntry':
          this.renderJournalEntry(document as JournalEntry)
          break
        case 'JournalEntryPage':
          this.renderJournalEntryPage(document.parent as JournalEntry, document.id)
          break
        default:
          // Invalid document type, so we just ignore it
          return
      }
    })
  }

  private renderJournalEntry(entry: JournalEntry) {
    entry.sheet?.render(true)
  }

  private renderJournalEntryPage(entry: JournalEntry, pageId: string | null) {
    const renderOptions = { pageId } as any // Hacky, but the typing seem to be outdated
    return entry.sheet?.render(true, renderOptions)
  }
}
