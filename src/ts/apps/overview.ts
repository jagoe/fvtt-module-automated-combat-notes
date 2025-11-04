import { ERROR, MODULE_HOOKS, MODULE_ID, VALID_DOCUMENT_TYPES } from '../constants'
import { FREQUENCY_OPTIONS, Frequency } from '../models/frequencies'
import { CombatNote, CombatNoteData } from '../models/note'
import { getNoteFromDragDropData } from '../services/combatNoteMapper'
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
    Handlebars.registerHelper('isFrequencyWithInterval', this.isFrequencyWithInterval.bind(this))
  }

  override async getData() {
    if (!this.notes.length) {
      this.notes = await loadNotes()
    }

    return {
      notes: [...this.notes],
      frequencyOptions: FREQUENCY_OPTIONS,
    }
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html)

    const dropTargets = html.find('.notes-drop-target')

    dropTargets.on('dragover', this.handleDragOver.bind(this))
    dropTargets.on('dragleave', this.handleDragLeave.bind(this))
    dropTargets.on('drop', this.handleDrop.bind(this))

    html.find('.delete-note').on('click', this.handleRemoveNote.bind(this))
    html.find('[name=frequency]').on('change', this.handleChangeFrequency.bind(this))
    html.find('[name=frequency-interval]').on('change', this.handleChangeFrequencyInterval.bind(this))
  }

  public appendDisplayButton(element: HTMLElement): void {
    if (element.querySelector('.open-combat-notes')) {
      return
    }

    const button = document.createElement('span')
    button.innerHTML = `
    <a
      class="combat-button open-combat-notes"
      aria-label="Open Combat Notes Overview"
      role="button"
      data-tooltip="ACN.overview.open.tooltip">
        <i class="fa-regular fa-note-sticky" />
    </a>`

    button.addEventListener('click', () => {
      this.render(true)
    })
    element.append(button)

    logger.trace(1000000)
  }

  private registerNoteHooks(): void {
    Hooks.on('updateJournalEntry', this.handleJournalEntryUpdate.bind(this))
    Hooks.on(MODULE_HOOKS.UpdateNotes, this.handleNotesUpdate.bind(this))
  }

  private handleDragOver(event: JQuery.DragOverEvent) {
    const data: CombatNoteData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

    if (data === null || data.uuid === undefined) {
      return
    }

    if (!VALID_DOCUMENT_TYPES.includes(data.type)) {
      return
    }

    if (this.notes.some((note) => note.uuid === data.uuid)) {
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

    const data: CombatNoteData | null = JSON.parse(event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null')

    if (data === null || data.uuid === undefined) {
      // This either is not a valid journal entry or it's something else entirely; either way, we ignore it
      return
    }

    if (this.notes.some((note) => note.uuid === data.uuid)) {
      ui.notifications?.warn(ERROR.DuplicateJournalEntry, { localize: true })
      return
    }

    const { note, error } = await getNoteFromDragDropData(data)

    if (error) {
      ui.notifications?.error(error, { localize: true, permanent: true })
      return
    }

    if (!note) {
      // Invalid data was dropped, so we just ignore it
      return
    }

    this.notes = [...this.notes, note]
    await saveNotes(this.notes)

    this.render()
  }

  private handleDragLeave(event: JQuery.DragLeaveEvent) {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  private async handleRemoveNote(event: JQuery.ClickEvent) {
    event.preventDefault()

    const button = event.currentTarget as HTMLElement
    const { uuid } = button.dataset

    if (!uuid) {
      return
    }

    this.notes = this.notes.filter((note) => note.uuid !== uuid)
    await saveNotes(this.notes)

    this.render()
  }

  private async handleChangeFrequency(event: JQuery.ChangeEvent) {
    const select = event.currentTarget as HTMLSelectElement
    const { uuid } = select.dataset

    if (!uuid) {
      return
    }

    const note = this.notes.find((n) => n.uuid === uuid)

    if (!note) {
      return
    }

    note.frequency = select.value as Frequency

    await saveNotes([...this.notes])
    this.render(false, { renderData: this.getData() })
  }

  private async handleChangeFrequencyInterval(event: JQuery.ChangeEvent) {
    const input = event.currentTarget as HTMLInputElement
    const { uuid } = input.dataset

    if (!uuid) {
      return
    }

    const note = this.notes.find((n) => n.uuid === uuid)

    if (!note) {
      return
    }

    const interval = Number.isNumeric(input.value) ? parseInt(input.value, 10) : 0
    note.frequencyInterval = interval < 0 ? 0 : interval
    note.frequencyCounter = 0

    await saveNotes([...this.notes])
    this.render(false, { renderData: this.getData() })
  }

  private handleJournalEntryUpdate(journal: JournalEntry): void {
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
  }

  private async handleNotesUpdate(): Promise<void> {
    this.notes = await loadNotes()
    this.render(false, { renderData: this.getData() })
  }

  private isFrequencyWithInterval(frequency: Frequency): boolean {
    return frequency === Frequency.EveryNth || frequency === Frequency.OnceNth
  }
}
