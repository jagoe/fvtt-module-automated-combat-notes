import { COMBAT_NOTE_STORAGE_TYPE, JOURNAL_ENTRY_TYPE, moduleId } from '../constants'
import { CombatNote, JournalEntryData } from '../models/note'

export default class AcnOverview extends Application {
  private notes: CombatNote[] = []

  private get game() {
    return game as Game
  }

  override get title(): string {
    return this.game.i18n.localize('ACN.overview.title')
  }

  static override get defaultOptions(): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'acn-overview',
      template: `modules/${moduleId}/templates/overview.hbs`,
      width: 720,
      height: 720,
    }) as ApplicationOptions
  }

  override getData() {
    const storedNotes = (this.game.user?.getFlag(moduleId, COMBAT_NOTE_STORAGE_TYPE) as JournalEntryData[]) ?? []

    this.notes = storedNotes
      .map((note) => this.getNoteFromJournalEntryData(note).note)
      // We ignore errors and empty notes because they shouldn't have been stored anyway
      .filter((note) => !!note) as CombatNote[]

    this.notes.forEach(this.registerNoteHooks.bind(this))

    return {
      notes: [...this.notes],
    }
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html)

    const dropTargets = html.find('.notes-drop-target')

    dropTargets.on('dragover', handleDragOver)
    dropTargets.on('dragleave', handleDragLeave)

    dropTargets.on('drop', this.handleDrop.bind(this))
  }

  private handleDrop(event: JQuery.DropEvent) {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    const data: JournalEntryData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

    const { note, error } = this.getNoteFromJournalEntryData(data)

    if (error) {
      ui.notifications?.error(this.game.i18n.localize(error))
      return
    }

    if (!note) {
      // Invalid data was dropped, so we just ignore it
      return
    }

    this.notes.push(note)

    if (!this.game.user) {
      ui.notifications?.error(this.game.i18n.localize('ACN.overview.error.missingUser'))
      return
    }

    this.game.user.setFlag(moduleId, COMBAT_NOTE_STORAGE_TYPE, this.notes.map(mapNoteToJournalEntryData))

    this.render()
  }

  private getNoteFromJournalEntryData(data: JournalEntryData | null): { error?: string; note?: CombatNote } {
    if (data === null || data.uuid === undefined) {
      // This either is not a valid journal entry or it's something else entirely; either way, we ignore it
      return {}
    }

    const { uuid, type } = data

    if (type !== JOURNAL_ENTRY_TYPE) {
      // Not necessarily an error, but also not a note
      return {}
    }

    const [, id] = uuid.split('.')

    const entry = this.game.journal?.get(id)

    if (!entry) {
      return { error: 'ACN.overview.error.unknownJournalEntry' }
    }

    const name = entry?.name ?? ''

    if (!name) {
      return { error: 'ACN.overview.error.missingJournalEntryName' }
    }

    return { note: { uuid, id, type, name } }
  }

  private registerNoteHooks(note: CombatNote): void {
    Hooks.on('updateJournalEntry', (journal: JournalEntry): void => {
      if (journal.id !== note.id) {
        return
      }

      const { name } = journal

      if (name === note.name || name === null) {
        return
      }

      note.name = name
      this.render()
    })
  }
}

function handleDragOver(event: JQuery.DragOverEvent) {
  const data: JournalEntryData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

  if (data === null || data.uuid === undefined) {
    return
  }

  if (data.type !== JOURNAL_ENTRY_TYPE) {
    return
  }

  const target = event.currentTarget as HTMLElement
  target.classList.add('drag-over')
  event.preventDefault()
}

function handleDragLeave(event: JQuery.DragLeaveEvent) {
  event.preventDefault()

  const target = event.currentTarget as HTMLElement
  target.classList.remove('drag-over')
}

function mapNoteToJournalEntryData(note: CombatNote): JournalEntryData {
  return { type: note.type, uuid: note.uuid }
}
