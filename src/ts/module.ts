// Do not remove this import. If you do Vite will think your styles are dead
// code and not include them in the build output.
import '../styles/style.scss'
import AcnOverview from './apps/overview'
import { MODULE_EVENT, MODULE_ID } from './constants'
import { CombatNoteLoader } from './services/combatNoteLoader'
import { ModuleEvents } from './services/moduleEvents'
import { ACN, DisplayEvent } from './types'

let module: ACN

Hooks.once('init', () => {
  console.log(`Initializing ${MODULE_ID}`)

  let g = game as Game
  module = g.modules.get(MODULE_ID) as ACN
  module.overview = new AcnOverview()
  module.loader = new CombatNoteLoader()
  module.events = new ModuleEvents()

  g.keybindings.register(MODULE_ID, 'show-acn-overview', {
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

  module.events.on(MODULE_EVENT.DisplayNotes, () => {
    displayNotes()
  })
})

Hooks.on('renderCombatTracker', (_: Application, html: JQuery) => {
  module.overview.appendDisplayButton(html.find('.combat-tracker-header .encounter-controls'))
})

Hooks.on(DisplayEvent.CombatStart, () => {
  module.events.emit(MODULE_EVENT.DisplayNotes)
  displayNotes()
})

function displayNotes() {
  module.loader.displayNotes()
}
