import type { ApplicationV2 } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/applications/api/_module.mjs'
import { ERROR, MODULE_HOOKS, MODULE_ID, VALID_DOCUMENT_TYPES } from '../constants'
import { FREQUENCY_OPTIONS, Frequency } from '../models/frequencies'
import { CombatNote, CombatNoteData } from '../models/note'
import { getNoteFromDragDropData } from '../services/combatNoteMapper'
import { loadNotes, saveNotes } from '../services/storage'

type AcnOverviewRenderContext = ApplicationV2.RenderContext & {
  notes: CombatNote[]
  frequencyOptions: typeof FREQUENCY_OPTIONS
}

type MixedType = ApplicationV2<AcnOverviewRenderContext> & { new (): ApplicationV2<AcnOverviewRenderContext> }

const { ApplicationV2: ApplicationV2Class, HandlebarsApplicationMixin } = foundry.applications.api
export default class AcnOverview extends (HandlebarsApplicationMixin(
  ApplicationV2Class<AcnOverviewRenderContext>,
) as MixedType) {
  private notes: CombatNote[] = []

  private get game() {
    return game as foundry.Game
  }

  override get title(): string {
    return this.game.i18n?.localize('ACN.overview.title') ?? 'ACN.overview.title'
  }

  static DEFAULT_OPTIONS() {
    const options: Partial<ApplicationV2.Configuration> = {
      uniqueId: MODULE_ID,
      id: 'acn-overview',
      classes: ['application'],
      position: {
        width: 720,
        height: 720,
      },
      window: {
        resizable: true,
      } as ApplicationV2.WindowConfiguration,
    }

    return options
  }

  static PARTS = {
    overview: {
      template: `modules/${MODULE_ID}/templates/overview.hbs`,
      classes: ['acn-overview'],
    },
  }

  constructor() {
    super()

    this.registerNoteHooks()
    Handlebars.registerHelper('isFrequencyWithInterval', this.isFrequencyWithInterval.bind(this))
  }

  protected override async _prepareContext(
    _options: CONST<ApplicationV2.RenderOptions> & { isFirstRender: boolean },
  ): Promise<AcnOverviewRenderContext> {
    if (!this.notes.length) {
      this.notes = await loadNotes()
    }

    return {
      notes: [...this.notes],
      frequencyOptions: FREQUENCY_OPTIONS,
    }
  }

  protected override _onRender(
    _context: CONST<AcnOverviewRenderContext>,
    _options: CONST<ApplicationV2.RenderOptions>,
  ): Promise<void> {
    const dropTargets = this.element.querySelector('.notes-drop-target')

    dropTargets?.addEventListener('dragover', this.handleDragOver.bind(this))
    dropTargets?.addEventListener('dragleave', this.handleDragLeave.bind(this))
    dropTargets?.addEventListener('drop', this.handleDrop.bind(this))

    this.element.querySelector('.delete-note')?.addEventListener('click', this.handleRemoveNote.bind(this))
    this.element.querySelector('[name=frequency]')?.addEventListener('change', this.handleChangeFrequency.bind(this))
    this.element
      .querySelector('[name=frequency-interval]')
      ?.addEventListener('change', this.handleChangeFrequencyInterval.bind(this))

    return Promise.resolve()
  }

  public toggle(): void {
    if (this.rendered) {
      this.close()
    } else {
      this.render(true)
    }
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
  }

  private registerNoteHooks(): void {
    Hooks.on('updateJournalEntry', this.handleJournalEntryUpdate.bind(this))
    Hooks.on(MODULE_HOOKS.UpdateNotes, this.handleNotesUpdate.bind(this))
  }

  private handleDragOver(event: Event) {
    const dragEvent = event as DragEvent

    const data: CombatNoteData | null = JSON.parse(dragEvent.dataTransfer?.getData('text/plain') ?? 'null')

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

  private async handleDrop(event: Event) {
    event.preventDefault()
    const dragEvent = event as DragEvent

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')

    const data: CombatNoteData | null = JSON.parse(dragEvent.dataTransfer?.getData('text/plain') ?? 'null')

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

  private handleDragLeave(event: Event) {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  private async handleRemoveNote(event: Event) {
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

  private async handleChangeFrequency(event: Event) {
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
    this.render(false)
  }

  private async handleChangeFrequencyInterval(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const { uuid } = input.dataset

    if (!uuid) {
      return
    }

    const note = this.notes.find((n) => n.uuid === uuid)

    if (!note) {
      return
    }

    const interval = Number.isNaN(input.value) ? 0 : parseInt(input.value, 10)
    note.frequencyInterval = interval < 0 ? 0 : interval
    note.frequencyCounter = 0

    await saveNotes([...this.notes])
    this.render(false)
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
    this.render(false)
  }

  private isFrequencyWithInterval(frequency: Frequency): boolean {
    return frequency === Frequency.EveryNth || frequency === Frequency.OnceNth
  }
}
