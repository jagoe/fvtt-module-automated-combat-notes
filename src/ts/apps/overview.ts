import { JOURNAL_ENTRY_TYPE, moduleId } from '../constants'
import { JournalEntryData } from '../models/note'
import { getNoteFromJournalEntryData } from '../services/combatNoteMapper'
import { loadNotes, saveNotes } from '../services/storage'

export default class AcnOverview extends Application {
  // private notes: CombatNote[] = []

  private get game() {
    return game as Game
  }

  override get title(): string {
    return this.game.i18n.localize('ACN.overview.title')
  }

  public toggle(): void {
    if (this.rendered) {
      this.close()
    } else {
      this.render(true)
    }
  }

  static override get defaultOptions(): ApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'acn-overview',
      template: `modules/${moduleId}/templates/overview.hbs`,
      width: 720,
      height: 720,
      resizable: true,
    }) as ApplicationOptions
  }

  constructor() {
    super()

    this.registerNoteHooks()
  }

  override getData() {
    const notes = loadNotes()

    return {
      notes: [...notes],
    }
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html)

    const dropTargets = html.find('.notes-drop-target')

    dropTargets.on('dragover', handleDragOver)
    dropTargets.on('dragleave', handleDragLeave)
    dropTargets.on('drop', this.handleDrop.bind(this))

    html.find('.delete-note').on('click', this.handleRemoveNote.bind(this))
  }

  private handleDrop(event: JQuery.DropEvent) {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    const data: JournalEntryData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

    const { note, error } = getNoteFromJournalEntryData(data)

    if (error) {
      ui.notifications?.error(this.game.i18n.localize(error))
      return
    }

    if (!note) {
      // Invalid data was dropped, so we just ignore it
      return
    }

    saveNotes([...loadNotes(), note])

    this.render()
  }

  private handleRemoveNote(event: JQuery.ClickEvent) {
    event.preventDefault()

    const button = event.currentTarget as HTMLElement
    const noteId = button.dataset.uuid

    if (!noteId) {
      return
    }

    saveNotes(loadNotes().filter((note) => note.uuid !== noteId))

    this.render()
  }

  private registerNoteHooks(): void {
    Hooks.on('updateJournalEntry', (journal: JournalEntry): void => {
      const notes = loadNotes().filter((n) => n.id === journal.id)

      if (!notes.length) {
        return
      }

      const { name } = journal

      notes.forEach((note) => {
        if (name === note.name || name === null) {
          return
        }

        note.name = name
      })

      this.render()
      // No need to persist, because the name will get fetched when loading anyway
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
