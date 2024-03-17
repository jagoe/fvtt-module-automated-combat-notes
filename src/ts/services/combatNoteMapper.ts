import { ERROR, VALID_DOCUMENT_TYPES } from '../constants'
import { CombatNote, JournalEntryData } from '../models'
import { AnyDocument } from '../types'

export function mapNoteToJournalEntryData(note: CombatNote): JournalEntryData {
  return { type: note.type, uuid: note.uuid, anchor: note.anchor }
}

export async function getNoteFromJournalEntryData(data: JournalEntryData | null): Promise<{
  error?: string
  note?: CombatNote
}> {
  if (data === null || data.uuid === undefined) {
    // This either is not a valid journal entry or it's something else entirely; either way, we ignore it
    return {}
  }

  const { uuid, type, anchor } = data

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
  if (anchor?.slug) {
    anchorElement.dataset.hash = anchor.slug
    anchorElement.innerHTML += ` &mdash; ${anchor.name}`
  }

  return { note: { uuid, type, name, anchorElement: anchorElement.outerHTML, anchor } }
}

export async function mapNoteToDocument(note: CombatNote): Promise<{
  uuid: string
  error?: string
  document?: AnyDocument
}> {
  const doc = (await fromUuid(note.uuid)) as JournalEntry | null

  if (!doc) {
    return { uuid: note.uuid, error: ERROR.UnknownJournalEntryId }
  }

  return { uuid: note.uuid, document: doc }
}
