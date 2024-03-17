import { MODULE_ID, VALID_DOCUMENT_TYPES } from '../constants'
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

  override async getData() {
    if (!this.notes.length) {
      this.notes = await loadNotes()
    }

    console.debug(100, this.notes)

    return {
      notes: [...this.notes],
    }
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html)

    const dropTargets = html.find('.notes-drop-target')

    dropTargets.on('dragover', this.handleDragOver.bind(this))
    dropTargets.on('dragleave', this.handleDragLeave.bind(this))
    dropTargets.on('drop', this.handleDrop.bind(this))

    html.find('.delete-note').on('click', this.handleRemoveNote.bind(this))
  }

  public appendDisplayButton(element: JQuery<HTMLElement>): void {
    if (element.find('.open-combat-notes').length) {
      return
    }

    const button = $(
      `<a class="combat-button open-combat-notes" aria-label="Open Combat Notes Overview" role="button" data-tooltip="ACN.overview.open.tooltip">
        <i class="fa-regular fa-note-sticky" />
      </button>`,
    )
    button.on('click', () => {
      this.render(true)
    })
    element.append(button)
  }

  private registerNoteHooks(): void {
    Hooks.on('updateJournalEntry', (journal: JournalEntry): void => {
      const notes = this.notes.filter((n) => n.uuid === journal.uuid)

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

  private handleDragOver(event: JQuery.DragOverEvent) {
    const data: JournalEntryData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

    if (data === null || data.uuid === undefined) {
      return
    }

    if (!VALID_DOCUMENT_TYPES.includes(data.type)) {
      return
    }

    const target = event.currentTarget as HTMLElement
    target.classList.add('drag-over')
    event.preventDefault()
  }

  private async handleDrop(event: JQuery.DropEvent) {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    const data: JournalEntryData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

    const { note, error } = await getNoteFromJournalEntryData(data)

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

  private handleDragLeave(event: JQuery.DragLeaveEvent) {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  private handleRemoveNote(event: JQuery.ClickEvent) {
    event.preventDefault()

    const button = event.currentTarget as HTMLElement
    const { uuid, index } = button.dataset

    if (!uuid) {
      return
    }

    this.notes = this.notes.filter((note, i) => note.uuid !== uuid || i !== Number(index))
    saveNotes(this.notes)

    this.render()
  }
}
