import { KEYBINDING, MODULE_ID, MODULE_NAME } from '../constants'
import { Frequency } from '../models/frequencies'
import { saveNotes } from '../services/storage'
import { ACN, CombatNoteData } from '../types'
import { expectThatEventually } from './helpers/expectToEventually'
import { loadNoteData } from './helpers/loadNotes'
import { waitFor } from './helpers/waitFor'

Hooks.on('quenchReady', (quench) => {
  quench.registerBatch(
    `${MODULE_ID}.e2e`,
    (context) => {
      const { describe, it, expect } = context
      const _game = game as Game
      const module = _game.modules.get(MODULE_ID) as ACN
      const overview = module.overview

      describe('Opening/closing the overview', () => {
        it('should display the combat notes overview when clicking the display button', async () => {
          // Arrange
          const encounterControls = document.querySelector('.combat-tracker-header .encounter-controls')
          const displayButton = encounterControls?.querySelector('a.open-combat-notes')
          await overview.close() // Ensure the overview is closed

          // Act
          displayButton?.dispatchEvent(new MouseEvent('click'))

          // Assert
          await expectThatEventually(() => overview.rendered).is.true
        })

        it('should toggle the combat notes overview open when pressing the keybinding', async () => {
          // Arrange
          const keybindings = _game.keybindings.get(MODULE_ID, KEYBINDING.ShowOverview)
          const keybinding = keybindings[0]
          await overview.close() // Ensure the overview is closed

          // Act
          KeyboardManager.emulateKeypress(false, keybinding.key, {
            altKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.ALT) ?? false,
            ctrlKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.CONTROL) ?? false,
            shiftKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.SHIFT) ?? false,
          })

          // Assert
          await expectThatEventually(() => overview.rendered).is.true
        })

        it('should toggle the combat notes overview closed when pressing the keybinding', async () => {
          // Arrange
          const keybindings = _game.keybindings.get(MODULE_ID, KEYBINDING.ShowOverview)
          const keybinding = keybindings[0]
          await overview.render(true) // Ensure the overview is open

          // Act
          KeyboardManager.emulateKeypress(false, keybinding.key, {
            altKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.ALT) ?? false,
            ctrlKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.CONTROL) ?? false,
            shiftKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.SHIFT) ?? false,
          })

          // Assert
          await expectThatEventually(() => overview.rendered).is.false
        })
      })

      describe('Combat Notes Overview', () => {
        let journalEntry: StoredDocument<JournalEntry>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let journalEntryPage: StoredDocument<any>

        before(async () => {
          const doc = await JournalEntry.create({
            name: 'Test Journal Entry (3975EED6-99BB-4482-9A1C-F5B87438E95C)',
          })

          if (!doc) {
            throw new Error('Failed to create journal entry')
          }

          const pageContent = '<h1>Heading</h1>'.padStart(1000, '<br />')
          const [page] = await doc.createEmbeddedDocuments('JournalEntryPage', [
            { name: 'Test Page (48CB3411-CF9F-4ED2-8F88-14D3656804A9)', text: { content: pageContent } },
          ])

          if (!page) {
            throw new Error('Failed to create journal entry page')
          }

          journalEntry = doc
          journalEntryPage = page

          await overview.render(true)
        })

        afterEach(async () => {
          await deleteNotesFromUI()
        })

        after(async () => {
          await overview.close()
          await journalEntry.delete()
        })

        describe('Adding a note', () => {
          it('should be possible to add a journal entry', async () => {
            // Arrange
            const noteData: CombatNoteData = {
              type: journalEntry.documentName,
              uuid: journalEntry.uuid,
              frequency: Frequency.Always,
            }
            const existingEntryCount = getNoteCount()

            // Act
            await addNoteViaDragAndDrop(noteData)

            // Assert
            await expectThatEventually(() => getNoteCount()).is.equal(existingEntryCount + 1)
            expect(document.querySelector('.acn-notes tbody tr:last-of-type a.content-link')?.textContent).is.equal(
              journalEntry.name,
            )
          })

          it('should be possible to add a journal entry page', async () => {
            // Arrange
            const noteData: CombatNoteData = {
              type: journalEntryPage.documentName,
              uuid: journalEntryPage.uuid,
              frequency: Frequency.Always,
            }
            const existingEntryCount = getNoteCount()

            // Act
            await addNoteViaDragAndDrop(noteData)

            // Assert
            await expectThatEventually(() => getNoteCount()).is.equal(existingEntryCount + 1)
            expect(document.querySelector('.acn-notes tbody tr:last-of-type a.content-link')?.textContent).is.equal(
              journalEntryPage.name,
            )
          })

          it('should be possible to add a journal entry page heading', async () => {
            // Arrange
            const noteData: CombatNoteData = {
              type: journalEntryPage.documentName,
              uuid: journalEntryPage.uuid,
              anchor: {
                slug: 'heading',
                name: 'Heading',
              },
              frequency: Frequency.Always,
            }
            const existingEntryCount = getNoteCount()

            // Act
            await addNoteViaDragAndDrop(noteData)

            // Assert
            await expectThatEventually(() => getNoteCount()).is.equal(existingEntryCount + 1)
            expect(document.querySelector('.acn-notes tbody tr:last-of-type a.content-link')?.textContent).is.equal(
              `${journalEntryPage.name} — ${noteData.anchor?.name}`,
            )
          })
        })

        it('should be possible to delete a note', async () => {
          // Arrange
          const noteData: CombatNoteData = {
            type: journalEntry.documentName,
            uuid: journalEntry.uuid,
            frequency: Frequency.Always,
          }
          await addNoteViaDragAndDrop(noteData)
          const existingEntryCount = getNoteCount()

          // Act
          await deleteNoteViaUI(journalEntry.uuid)

          // Assert
          await expectThatEventually(() => getNoteCount()).is.equal(existingEntryCount - 1)
        })

        it('should be possible to change the frequency of a note', async () => {
          // Arrange
          const noteData: CombatNoteData = {
            type: journalEntry.documentName,
            uuid: journalEntry.uuid,
            frequency: Frequency.Always,
          }
          await addNoteViaDragAndDrop(noteData)
          const select = document.querySelector('.acn-notes select[data-uuid]') as HTMLSelectElement
          const existingFrequency = select.value

          // Act
          select.value = Frequency.Never
          select.dispatchEvent(new Event('change'))

          // Assert
          await expectThatEventually(() => select.value).is.equal(Frequency.Never)
          await expectThatEventually(() => select.value).is.not.equal(existingFrequency)
        })
      })

      describe('Displaying notes', () => {
        let journalEntry: StoredDocument<JournalEntry>

        before(async () => {
          const doc = await JournalEntry.create({
            name: 'Test Journal Entry (034FEBF8-DB28-4535-9156-17ACFA5E76AF)',
          })

          if (!doc) {
            throw new Error('Failed to create journal entry')
          }

          journalEntry = doc
        })

        afterEach(async () => {
          await deleteNotes()
          await _game.combat?.delete()
        })

        after(async () => {
          await journalEntry.delete()
        })

        it('should display notes when combat starts', async () => {
          // Arrange
          const noteData: CombatNoteData = {
            type: journalEntry.documentName,
            uuid: journalEntry.uuid,
            frequency: Frequency.Always,
          }
          await addNote(noteData)

          // Act
          await startCombat()

          // Assert
          await expectThatEventually.timeout(5000)(() => journalEntry.sheet?.rendered).is.true
        })

        describe.skip('Frequency', () => {
          it('should not display a note with a frequency of "never"', () => {
            //
          })

          it('should display a note with a frequency of "once" only once', () => {
            //
          })

          it('should display a note with a frequency of "always" everytime', () => {
            //
          })

          it('should display a note with a frequency of "once in n" in the nth combat', () => {
            //
          })

          it('should display a note with a frequency of "every n" every n combats', () => {
            //
          })
        })
      })

      async function addNoteViaDragAndDrop({ type, uuid, anchor, frequency }: CombatNoteData) {
        const dropTarget = document.querySelector('.acn-notes .notes-drop-target')
        const noteData: CombatNoteData = {
          type,
          uuid,
          anchor,
          frequency,
        }
        const dropData = new DataTransfer()
        dropData.setData('text/plain', JSON.stringify(noteData))
        dropTarget?.dispatchEvent(new DragEvent('drop', { dataTransfer: dropData }))

        await waitFor(() => !!document.querySelector(`.acn-notes a.content-link[data-uuid="${uuid}"]`))
      }

      async function addNote({ type, uuid, anchor, frequency }: CombatNoteData) {
        const notes = loadNoteData()
        const noteData: CombatNoteData = {
          type,
          uuid,
          anchor,
          frequency,
          frequencyInterval: 0,
          frequencyCounter: 0,
        }
        await saveNotes([...notes, noteData])

        await waitFor(async () => {
          const notes = loadNoteData()
          return notes.some((note) => note.uuid === uuid)
        })
      }

      async function deleteNoteViaUI(uuid: string) {
        const selector = `.acn-notes .delete-note[data-uuid="${uuid}"]`
        const deleteLink = document.querySelector(selector)
        if (!deleteLink) {
          // Note doesn't exist, nothing to delete
          return
        }

        deleteLink.dispatchEvent(new MouseEvent('click'))
        await waitFor(() => !document.querySelector(selector))
      }

      async function deleteNotesFromUI() {
        const deleteLinks = document.querySelectorAll('.acn-notes .delete-note')
        deleteLinks.forEach((link) => link.dispatchEvent(new MouseEvent('click')))

        await waitFor(() => !document.querySelector('.acn-notes .delete-note'))
      }

      async function deleteNotes() {
        await saveNotes([])

        await waitFor(async () => {
          const notes = loadNoteData()
          return notes.length === 0
        })
      }

      function getNoteCount() {
        return document.querySelectorAll('.acn-notes tbody tr').length
      }

      async function startCombat() {
        const combat = await Combat.create({})
        await combat?.startCombat()
        waitFor(() => _game.combat?.started || false)
      }
    },
    {
      displayName: `${MODULE_NAME}: E2E Tests`,
      preSelected: false,
    },
  )
})
