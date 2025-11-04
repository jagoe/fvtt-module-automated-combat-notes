// Do not remove this import. If you do Vite will think your styles are dead
// code and not include them in the build output.
import '../styles/style.scss'
import AcnOverview from './apps/overview'
import { FOUNDRY_EVENT, KEYBINDING, MODULE_EVENT, MODULE_ID, MODULE_NAME } from './constants'
import { CombatNoteLoader } from './services/combatNoteLoader'
import { ModuleEvents as ModuleSocket } from './services/moduleSocket'
import { ACN } from './types'

let module: ACN

Hooks.once('init', () => {
  console.log(`${MODULE_NAME} | Initializing`)

  const _game = game as Game
  module = _game.modules.get(MODULE_ID) as ACN
  module.overview = new AcnOverview()
  module.loader = new CombatNoteLoader()
  module.socket = new ModuleSocket()

  _game.keybindings.register(MODULE_ID, KEYBINDING.ShowOverview, {
    name: 'ACN.overview.open.keybinding.label',
    hint: 'ACN.overview.open.keybinding.hint',
    editable: [
      {
        key: 'KeyJ',
        modifiers: [KeyboardManager.MODIFIER_KEYS.ALT],
      },
    ],
    onDown: () => module.overview.toggle(),
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
  })

  module.socket.on(MODULE_EVENT.DisplayNotes, () => {
    displayNotes()
  })
})

Hooks.on('renderCombatTracker', (_: Application, html: HTMLElement) => {
  const combatTrackerControls = html.querySelector(
    '.combat-tracker-header .encounter-controls .control-buttons.right',
  ) as HTMLElement
  if (!combatTrackerControls) {
    logger.warn('Could not find combat tracker controls to attach combat notes display button to')
    return
  }

  module.overview.appendDisplayButton(combatTrackerControls)
})

Hooks.on(FOUNDRY_EVENT.CombatStart, () => {
  module.socket.emit(MODULE_EVENT.DisplayNotes)
  displayNotes()
})

Hooks.on(
  FOUNDRY_EVENT.CombatRound,
  (
    _combat: Combat,
    updateData: { round: number; turn: number | null },
    _updateOptions: { advanceTime: number; direction: number },
  ): void => {
    if (updateData.round === 1 && updateData.turn === null) {
      module.socket.emit(MODULE_EVENT.DisplayNotes)
      displayNotes()
    }
  },
)

function displayNotes() {
  module.loader.displayNotes()
}
