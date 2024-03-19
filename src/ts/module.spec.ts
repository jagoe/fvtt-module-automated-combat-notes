import sinon from 'sinon'
import { FOUNDRY_EVENT, KEYBINDING, MODULE_ID, MODULE_NAME } from './constants'
import { ACN } from './types'

Hooks.on('quenchReady', (quench) => {
  quench.registerBatch(
    `${MODULE_ID}.module`,
    (context) => {
      const { describe, it, expect, before, after } = context
      const _game = game as Game

      describe('Initialization', () => {
        it('should register the module', () => {
          // Arrange
          const module = _game.modules.get(MODULE_ID)

          // Assert
          expect(module).to.exist
        })

        it('should register the keybinding to open the notes overview', () => {
          // Arrange
          const keybindings = _game.keybindings.get(MODULE_ID, KEYBINDING.ShowOverview)

          // Assert
          expect(keybindings).to.have.length(1)
        })

        it('should register the overview app', () => {
          // Arrange
          const module = _game.modules.get(MODULE_ID) as ACN

          // Assert
          expect(module.overview).to.exist
        })

        it('should register the combat note loader service', () => {
          // Arrange
          const module = _game.modules.get(MODULE_ID) as ACN

          // Assert
          expect(module.loader).to.exist
        })

        it('should register the module events service', () => {
          // Arrange
          const module = _game.modules.get(MODULE_ID) as ACN

          // Assert
          expect(module.socket).to.exist
        })

        it('should render the display button in the combat tracker', () => {
          // Arrange
          const encounterControls = document.querySelector('.combat-tracker-header .encounter-controls')
          const displayButton = encounterControls?.querySelector('a.open-combat-notes')

          // Assert
          expect(displayButton).to.exist
        })

        it('should register the combat start event listener', () => {
          // Arrange
          const allEvents: Record<string, []> = (Hooks as any).events
          const displayNoteEvents = allEvents[FOUNDRY_EVENT.CombatStart]

          // Assert
          expect(displayNoteEvents).to.have.length.greaterThanOrEqual(1)
        })

        it('should register the module socket event listener', () => {
          // Assert
          expect(_game.socket?.hasListeners(`module.${MODULE_ID}`)).to.be.true
        })

        describe('Notes overview keybinding', () => {
          // Spy on the keybinding action
          const keybinding = _game.keybindings.get(MODULE_ID, KEYBINDING.ShowOverview)[0]
          const action = _game.keybindings.activeKeys
            .get(keybinding.key)
            ?.find((k) => k.action === `${MODULE_ID}.${KEYBINDING.ShowOverview}`)!
          const originalKeybinding = action.onDown!
          const keybindingSpy = sinon.spy()

          // Spy on the overview rendering
          const overview = (_game.modules.get(MODULE_ID) as ACN).overview
          const originalToggle = overview.toggle
          const toggleSpy = sinon.spy()

          before(() => {
            action.onDown = keybindingSpy
            overview.toggle = toggleSpy
          })

          after(() => {
            action.onDown = originalKeybinding
            overview.toggle = originalToggle
          })

          it('should trigger the keybinding when the correct keys get pressed', async () => {
            // Act
            KeyboardManager.emulateKeypress(false, keybinding.key, {
              altKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.ALT) ?? false,
              ctrlKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.CONTROL) ?? false,
              shiftKey: keybinding.modifiers?.includes(KeyboardManager.MODIFIER_KEYS.SHIFT) ?? false,
            })

            // Assert
            expect(keybindingSpy.called).to.be.true
          })

          it('should toggle the overview app when the keybinding gets triggered', async () => {
            // Arrange
            const context = {} as KeyboardEventContext

            // Act - Toggle on
            originalKeybinding(context)

            // Assert
            expect(toggleSpy.called).to.be.true
          })
        })
      })
    },
    {
      displayName: `${MODULE_NAME}: Module tests`,
    },
  )
})
