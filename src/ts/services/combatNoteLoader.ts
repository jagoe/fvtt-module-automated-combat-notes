import { mapNoteToJournalEntry } from './combatNoteMapper'
import { loadNotes } from './storage'

export class CombatNoteLoader {
  public displayNotes() {
    const g = game as Game
    const notes = loadNotes()

    const mapResults = notes.map(mapNoteToJournalEntry)

    const errors = mapResults.filter((result) => result.error !== undefined)
    errors.forEach(({ id, error }) => ui.notifications?.error(g.i18n.format(error!, { id }), { permanent: true }))

    const entries = mapResults.filter((result) => result.entry !== undefined).map((result) => result.entry)
    entries.forEach((entry) => entry!.sheet?.render(true))
  }
}
