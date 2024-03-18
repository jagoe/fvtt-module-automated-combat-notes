import { Frequency } from './frequencies'

export type DocumentDragDropData = {
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

export type CombatNoteData = DocumentDragDropData & {
  /**
   * Frequency of the note
   */
  frequency: Frequency

  /**
   * Frequency interval of the note (i.e. every N combats or once in the Nth combat)
   */
  frequencyInterval?: number

  /**
   * Frequency counter for the note
   */
  frequencyCounter?: number
}

export type CombatNote = CombatNoteData & {
  /**
   * Journal entry name
   */
  name: string

  /**
   * FVTT anchor element HTML to reference the note
   */
  anchorElement: string
}
