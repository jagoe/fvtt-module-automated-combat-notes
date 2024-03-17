import { mapNoteToJournalEntry } from './combatNoteMapper'
import { loadNotes } from './storage'

export class CombatNoteLoader {
  public async displayNotes() {
    const g = game as Game
    const notes = await loadNotes()

    const mapResults = await Promise.all(notes.map(mapNoteToJournalEntry))

    const errors = mapResults.filter((result) => result.error !== undefined)
    errors.forEach(({ uuid, error }) => ui.notifications?.error(g.i18n.format(error!, { uuid }), { permanent: true }))

    const entries = mapResults.filter((result) => result.entry !== undefined).map((result) => result.entry)
    entries.forEach((entry) => entry!.sheet?.render(true))
  }
}
