import { moduleId } from '../constants'
import { CombatNote, JournalEntryData } from '../models/note'

export default class Overview extends Application {
  // TODO: When loading, set name automatically
  private notes: CombatNote[] = [
    {
      uuid: 'JournalEntry.h7BN5ZNBTKvdzaS5',
      id: 'h7BN5ZNBTKvdzaS5',
      type: 'JournalEntry',
      name: 'Test',
    },
  ]

  override get title(): string {
    return (game as Game).i18n.localize('ACN.overview.title')
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
    // TODO: Initialize notes
    return {
      notes: [...this.notes],
    }
  }

  override activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html)

    const dropTargets = html.find('.notes-drop-target')

    // TODO: Extract event handlers to methods
    dropTargets.on('dragover', (event) => {
      const data: JournalEntryData | null = JSON.parse(
        event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null',
      )

      if (data === null || data.uuid === undefined) {
        return
      }

      // TODO: Move 'JournalEntry' to a constant
      if (data.type !== 'JournalEntry') {
        return
      }

      const target = event.currentTarget as HTMLElement
      target.classList.add('drag-over')
      event.preventDefault()
    })

    dropTargets.on('dragleave', (event) => {
      event.preventDefault()

      const target = event.currentTarget as HTMLElement
      target.classList.remove('drag-over')
    })

    dropTargets.on('drop', (event) => {
      event.preventDefault()

      const g = game as Game
      const target = event.currentTarget as HTMLElement
      target.classList.remove('drag-over')

      const data: JournalEntryData | null = JSON.parse(
        event.originalEvent?.dataTransfer?.getData('text/plain') ?? 'null',
      )

      if (data === null || data.uuid === undefined) {
        ui.notifications?.error(g.i18n.localize('ACN.overview.error.invalidElement'))
        return
      }

      const [type, id] = data.uuid.split('.')

      if (type !== 'JournalEntry') {
        // We can just ignore this, because nothing should happen
        return
      }

      const entry = g.journal?.get(id)

      if (!entry) {
        ui.notifications?.error(g.i18n.localize('ACN.overview.error.unknownJournalEntry'))

        return
      }

      const name = entry.name

      if (!name) {
        ui.notifications?.error(g.i18n.localize('ACN.overview.error.missingJournalEntryName'))

        return
      }

      const note: CombatNote = {
        uuid: data.uuid,
        id,
        type,
        name: entry.name,
      }

      this.notes.push(note)

      // TODO: Persist notes

      this.render()
    })
  }
}
