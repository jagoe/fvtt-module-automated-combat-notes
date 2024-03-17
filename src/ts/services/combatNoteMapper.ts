import { ERROR, JOURNAL_ENTRY_TYPE } from '../constants'
import { CombatNote, JournalEntryData } from '../models'

export function mapNoteToJournalEntryData(note: CombatNote): JournalEntryData {
  return { type: note.type, uuid: note.uuid }
}

export async function getNoteFromJournalEntryData(data: JournalEntryData | null): Promise<{
  error?: string
  note?: CombatNote
}> {
  if (data === null || data.uuid === undefined) {
    // This either is not a valid journal entry or it's something else entirely; either way, we ignore it
    return {}
  }

  const { uuid, type } = data

  if (type !== JOURNAL_ENTRY_TYPE) {
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

  return { note: { uuid, type, name } }
}

export async function mapNoteToJournalEntry(note: CombatNote): Promise<{
  uuid: string
  error?: string
  entry?: JournalEntry
}> {
  const doc = (await fromUuid(note.uuid)) as JournalEntry | null

  if (!doc) {
    return { uuid: note.uuid, error: ERROR.UnknownJournalEntryId }
  }

  return { uuid: note.uuid, entry: doc }
}
