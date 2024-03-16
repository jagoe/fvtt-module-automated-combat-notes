import { JOURNAL_ENTRY_TYPE, MODULE_ID } from '../constants'
import { CombatNote, JournalEntryData } from '../models/note'
import { getNoteFromJournalEntryData } from '../services/combatNoteMapper'
import { loadNotes, saveNotes } from '../services/storage'

export default class AcnOverview extends Application {
  private notes: CombatNote[] = []

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
      template: `modules/${MODULE_ID}/templates/overview.hbs`,
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
    if (!this.notes.length) {
      this.notes = loadNotes()
    }

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

    html.find('.delete-note').on('click', this.handleRemoveNote.bind(this))
  }

  private handleDrop(event: JQuery.DropEvent) {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    const data: JournalEntryData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

    const { note, error } = getNoteFromJournalEntryData(data)

    if (error) {
      ui.notifications?.error(error, { localize: true, permanent: true })
      return
    }

    if (!note) {
      // Invalid data was dropped, so we just ignore it
      return
    }

    this.notes = [...this.notes, note]
    saveNotes(this.notes)

    this.render()
  }

  private handleRemoveNote(event: JQuery.ClickEvent) {
    event.preventDefault()

    const button = event.currentTarget as HTMLElement
    const { uuid, index } = button.dataset

    if (!uuid) {
      return
    }

    console.log(
      100,
      this.notes.filter((note, i) => note.uuid !== uuid && i !== Number(index)),
    )

    this.notes = this.notes.filter((note, i) => note.uuid !== uuid || i !== Number(index))
    saveNotes(this.notes)

    this.render()
  }

  private registerNoteHooks(): void {
    Hooks.on('updateJournalEntry', (journal: JournalEntry): void => {
      const notes = this.notes.filter((n) => n.id === journal.id)

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

      // No need to persist, because the name will get fetched when loading anyway
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
