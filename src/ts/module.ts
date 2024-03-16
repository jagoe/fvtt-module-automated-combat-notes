// Do not remove this import. If you do Vite will think your styles are dead
// code and not include them in the build output.
import '../styles/style.scss'
import AcnOverview from './apps/overview'
import { MODULE_ID } from './constants'
import { CombatNoteLoader } from './services/combatNoteLoader'
import { ACN, DisplayEvent } from './types'

let module: ACN

Hooks.once('init', () => {
  console.log(`Initializing ${MODULE_ID}`)

  let g = game as Game
  module = g.modules.get(MODULE_ID) as ACN
  module.overview = new AcnOverview()
  module.loader = new CombatNoteLoader()

  g.keybindings.register(MODULE_ID, 'show-acn-overview', {
    name: 'ACN.overview.open.keybinding.label',
    hint: 'ACN.overview.open.keybinding.hint',
    editable: [
      {
        key: 'J',
        modifiers: [KeyboardManager.MODIFIER_KEYS.ALT],
      },
    ],
    onDown: () => module.overview.toggle(),
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
  })
})

Hooks.on('renderCombatTracker', (_: Application, html: JQuery) => {
  const button = $(
    `<a class="combat-button" aria-label="Open Combat Notes Overview" role="button" data-tooltip="ACN.overview.open.tooltip">
      <i class="fa-regular fa-note-sticky" />
    </button>`,
  )
  button.on('click', () => {
    module.overview.render(true)
  })
  html.find('.combat-tracker-header > nav').append(button)
})

Hooks.on(DisplayEvent.CombatStart, () => {
  module.loader.displayNotes()
})
