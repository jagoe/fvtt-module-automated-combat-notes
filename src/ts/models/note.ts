export type CombatNote = {
  /**
   * Foundry app UUID
   */
  uuid: string
  /**
   * Foundry app type
   */
  type: string
  /**
   * Journal entry name
   */
  name: string
  /**
   * FVTT anchor element HTML to reference the note
   */
  anchor: string
}

export type JournalEntryData = {
  /**
   * Foundry app UUID
   */
  uuid: string
  /**
   * Foundry app type
   */
  type: string
}
