import GameClass from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/game.d.mts';
import '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/head'
import BaseModule from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages/base-module.d.mts';

export {}

declare global {
  declare namespace foundry {
    class Game extends GameClass {
      MonksEnhancedJournal: {
        openJournalEntry(entry: JournalEntry | JournalEntryPage, options: { anchor?: string; newtab?: boolean }): void
        getMEJType(entry: JournalEntry | JournalEntryPage): string | undefined
        fixType(page: JournalEntryPage): void
      }

      modules: foundry.Game.ModuleCollection
    }
  }

  declare namespace foundry.Game {
    interface ModuleCollection1 {
      static has(module: string): boolean
      static get(module: string): BaseModule
    }
  }
}
