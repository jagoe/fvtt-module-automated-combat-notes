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
  anchorElement: string
  /**
   * Optional anchor for headings in the note
   */
  anchor?: {
    /**
     * Anchor name
     */
    name: string
    /**
     * Anchor slug
     */
    slug?: string
  }
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
  /**
   * Container holding information about the anchor to be navigated to
   */
  anchor?: {
    /**
     * Anchor name
     */
    name: string
    /**
     * Anchor slug
     */
    slug?: string
  }
}
