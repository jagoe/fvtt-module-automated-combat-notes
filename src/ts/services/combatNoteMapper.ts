import { ERROR, VALID_DOCUMENT_TYPES } from '../constants'
import { CombatNote, CombatNoteData, DocumentDragDropData } from '../models'
import { Frequency } from '../models/frequencies'

export async function getNoteFromDragDropData(data: DocumentDragDropData): Promise<{
  error?: string
  note?: CombatNote
}> {
  const combatNoteData: CombatNoteData = {
    ...data,
    frequency: Frequency.Always,
    frequencyInterval: 0,
    frequencyCounter: 0,
  }
  return await getNoteFromStorageData(combatNoteData)
}

export async function getNoteFromStorageData(data: CombatNoteData): Promise<{ error?: string; note?: CombatNote }> {
  const { uuid, type, anchor, frequency, frequencyInterval, frequencyCounter } = data

  if (!VALID_DOCUMENT_TYPES.includes(type)) {
    // Not necessarily an error, but also not a note
    return {}
  }

  const doc = await fromUuid(uuid)

  if (!doc) {
    return { error: ERROR.UnknownJournalEntry }
  }

  const name = doc?.name ?? ''

  if (!name) {
    return { error: ERROR.MissingJournalEntryName }
  }

  const anchorDocument = doc as unknown as { toAnchor: () => HTMLAnchorElement }
  const anchorElement = anchorDocument.toAnchor()
  anchorElement.draggable = true
  if (anchor?.slug) {
    anchorElement.dataset.hash = anchor.slug
    anchorElement.innerHTML += ` &mdash; ${anchor.name}`
  }

  return {
    note: {
      uuid,
      type,
      name,
      anchorElement: anchorElement.outerHTML,
      anchor,
      frequency,
      frequencyInterval,
      frequencyCounter,
    },
  }
}

export async function mapNoteToDocument(note: CombatNote): Promise<{
  uuid: string
  error?: string
  document?: JournalEntry | JournalEntryPage
}> {
  const doc = (await fromUuid(note.uuid)) as JournalEntry | null

  if (!doc) {
    return { uuid: note.uuid, error: ERROR.UnknownJournalEntryId }
  }

  return { uuid: note.uuid, document: doc }
}
