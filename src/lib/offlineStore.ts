import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

import type { VerhuurCheckInput } from '../api/verhuurcheck'

export interface DraftBerekening {
  id: string
  input: VerhuurCheckInput
  bijgewerktOp: number
}

export interface RecentAdres {
  id: string
  postcode: string
  huisnummer: string
  huisletter?: string
  gezochtOp: number
}

interface VerhuurcheckDB extends DBSchema {
  draftBerekeningen: { key: string; value: DraftBerekening }
  recenteAdressen: { key: string; value: RecentAdres }
}

const MAX_RECENTE_ADRESSEN = 10

let dbPromise: Promise<IDBPDatabase<VerhuurcheckDB>> | null = null

function getDb(): Promise<IDBPDatabase<VerhuurcheckDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VerhuurcheckDB>('verhuurcheck', 1, {
      upgrade(db) {
        db.createObjectStore('draftBerekeningen', { keyPath: 'id' })
        db.createObjectStore('recenteAdressen', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function saveDraft(id: string, input: VerhuurCheckInput): Promise<void> {
  const db = await getDb()
  await db.put('draftBerekeningen', { id, input, bijgewerktOp: Date.now() })
}

export async function loadDraft(id: string): Promise<DraftBerekening | undefined> {
  const db = await getDb()
  return db.get('draftBerekeningen', id)
}

export async function listDrafts(): Promise<DraftBerekening[]> {
  const db = await getDb()
  const drafts = await db.getAll('draftBerekeningen')
  return drafts.sort((a, b) => b.bijgewerktOp - a.bijgewerktOp)
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('draftBerekeningen', id)
}

export async function addRecentAdres(
  adres: Omit<RecentAdres, 'id' | 'gezochtOp'>
): Promise<void> {
  const db = await getDb()
  // Zelfde adres opnieuw zoeken overschrijft de bestaande invoer (geen duplicaten)
  const id = `${adres.postcode} ${adres.huisnummer}${adres.huisletter ?? ''}`
  const tx = db.transaction('recenteAdressen', 'readwrite')
  await tx.store.put({ ...adres, id, gezochtOp: Date.now() })
  const alle = await tx.store.getAll()
  const teOud = alle.sort((a, b) => b.gezochtOp - a.gezochtOp).slice(MAX_RECENTE_ADRESSEN)
  for (const oud of teOud) {
    await tx.store.delete(oud.id)
  }
  await tx.done
}

export async function listRecenteAdressen(): Promise<RecentAdres[]> {
  const db = await getDb()
  const alle = await db.getAll('recenteAdressen')
  return alle.sort((a, b) => b.gezochtOp - a.gezochtOp)
}

// Test-helper: sluit de gedeelde verbinding zodat fake-indexeddb per test vers kan starten
export async function closeDb(): Promise<void> {
  if (dbPromise) {
    ;(await dbPromise).close()
    dbPromise = null
  }
}
