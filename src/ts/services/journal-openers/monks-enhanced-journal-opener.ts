import { FoundryJournalOpener } from './foundry-journal-opener'
import { JournalOpener } from './journal-opener'

export class MonksEnhancedJournalOpener implements JournalOpener {
  public static MODULE_ID = 'monks-enhanced-journal'

  private static get _game() {
    return game as foundry.Game
  }

  public static isActive(): boolean {
    return this._game.modules.has(this.MODULE_ID)
  }

  public openJournalEntry(document: JournalEntry | JournalEntryPage, anchor?: string) {
    const MEJ = MonksEnhancedJournalOpener._game.MonksEnhancedJournal

    if (document.documentName !== 'JournalEntryPage' && !!MEJ.getMEJType(document)) {
      const journalEntry = document as JournalEntry
      const page = journalEntry.pages.contents[0]
      MEJ.fixType(page)
      page.sheet.render(true, { anchor })
    } else {
      const defaultOpener = new FoundryJournalOpener()
      defaultOpener.openJournalEntry(document, anchor)
    }
  }
}
