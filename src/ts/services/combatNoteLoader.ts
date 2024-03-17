import { CombatNote } from '../models'
import { Frequency } from '../models/frequencies'
import { AnyDocument } from '../types'
import { mapNoteToDocument } from './combatNoteMapper'
import { loadNotes, saveNotes } from './storage'

export class CombatNoteLoader {
  public async displayNotes() {
    const g = game as Game
    const notes = await loadNotes()

    const mapResults = await Promise.all(notes.map(async (note) => ({ note, ...(await mapNoteToDocument(note)) })))

    const errors = mapResults.filter((result) => result.error !== undefined)
    errors.forEach(({ uuid, error }) => ui.notifications?.error(g.i18n.format(error!, { uuid }), { permanent: true }))

    mapResults
      .filter((result) => result.document !== undefined)
      .map((result) => ({ document: result.document, note: result.note }))
      .forEach(({ note, document }) => this.renderNote(note, document))

    saveNotes([...notes])
    // TODO: Trigger a hook to update the UI
  }

  private renderNote(note: CombatNote, document?: AnyDocument) {
    if (!document) {
      return
    }

    const documentName = document.documentName as string | null | undefined

    this.countDown(note)

    if (!this.shouldBeDisplayed(note)) {
      return
    }

    this.reset(note)

    switch (documentName) {
      case 'JournalEntry':
        this.renderJournalEntry(document as JournalEntry)
        break
      case 'JournalEntryPage':
        this.renderJournalEntryPage(document.parent as JournalEntry, document.id, note.anchor?.slug)
        break
      default:
        // Invalid document type, so we just ignore it
        return
    }
  }

  private renderJournalEntry(entry: JournalEntry) {
    entry.sheet?.render(true)
  }

  private renderJournalEntryPage(entry: JournalEntry, pageId: string | null, slug?: string) {
    const renderOptions = { pageId, anchor: slug } as any // Hacky, but the typing seem to be outdated

    return entry.sheet?.render(true, renderOptions)
  }

  private countDown(note: CombatNote) {
    if (note.frequency === Frequency.EveryNth || note.frequency === Frequency.OnceAfterN) {
      // TODO: Count down
      // TODO: Store counter & original value
    }
  }

  private shouldBeDisplayed(note: CombatNote): boolean {
    if (note.frequency === Frequency.Always || note.frequency === Frequency.Once) {
      return true
    }

    if (note.frequency === Frequency.Never) {
      return false
    }

    if (note.frequency === Frequency.EveryNth || note.frequency === Frequency.OnceAfterN) {
      // TODO: Depends on counter
      return false
    }

    return false
  }

  private reset(note: CombatNote) {
    if (note.frequency === Frequency.Always || note.frequency === Frequency.Never) {
      return
    }

    if (note.frequency === Frequency.EveryNth) {
      // TODO: Reset to original N
      return
    }

    if (note.frequency === Frequency.Once || note.frequency === Frequency.OnceAfterN) {
      note.frequency = Frequency.Never
    }
  }
}
