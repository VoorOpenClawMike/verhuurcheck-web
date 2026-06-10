// Registreert IDBRequest e.d. als globals — jsdom levert die niet
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'

import {
  saveDraft,
  loadDraft,
  listDrafts,
  deleteDraft,
  addRecentAdres,
  listRecenteAdressen,
  closeDb,
} from './offlineStore'
import type { VerhuurCheckInput } from '../api/verhuurcheck'

const input: VerhuurCheckInput = {
  postcode: '1234AB',
  huisnummer: '42',
  buitenruimte_m2: 10,
  keuken: 'basis',
  sanitair: 'luxe',
}

beforeEach(async () => {
  await closeDb()
  globalThis.indexedDB = new IDBFactory()
  // Oplopende klok zodat de sorteervolgorde op tijdstempel deterministisch is
  let tijd = 1_000_000
  vi.spyOn(Date, 'now').mockImplementation(() => tijd++)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('drafts', () => {
  it('loadDraft geeft het opgeslagen concept terug', async () => {
    await saveDraft('concept-1', input)
    const draft = await loadDraft('concept-1')
    expect(draft?.input).toEqual(input)
  })

  it('loadDraft geeft undefined voor een onbekend id', async () => {
    expect(await loadDraft('bestaat-niet')).toBeUndefined()
  })

  it('listDrafts sorteert meest recent bijgewerkt eerst', async () => {
    await saveDraft('oud', input)
    await saveDraft('nieuw', input)
    const drafts = await listDrafts()
    expect(drafts.map((d) => d.id)).toEqual(['nieuw', 'oud'])
  })

  it('deleteDraft verwijdert het concept', async () => {
    await saveDraft('concept-1', input)
    await deleteDraft('concept-1')
    expect(await loadDraft('concept-1')).toBeUndefined()
  })
})

describe('recente adressen', () => {
  it('addRecentAdres overschrijft hetzelfde adres in plaats van te dupliceren', async () => {
    await addRecentAdres({ postcode: '1234AB', huisnummer: '42' })
    await addRecentAdres({ postcode: '1234AB', huisnummer: '42' })
    const adressen = await listRecenteAdressen()
    expect(adressen).toHaveLength(1)
  })

  it('listRecenteAdressen sorteert meest recent gezocht eerst', async () => {
    await addRecentAdres({ postcode: '1111AA', huisnummer: '1' })
    await addRecentAdres({ postcode: '2222BB', huisnummer: '2' })
    const adressen = await listRecenteAdressen()
    expect(adressen.map((a) => a.id)).toEqual(['2222BB 2', '1111AA 1'])
  })

  it('bewaart maximaal 10 adressen', async () => {
    for (let i = 1; i <= 12; i++) {
      await addRecentAdres({ postcode: `${1000 + i}AB`, huisnummer: String(i) })
    }
    expect(await listRecenteAdressen()).toHaveLength(10)
  })

  it('verwijdert de oudste adressen bij overschrijding van het maximum', async () => {
    for (let i = 1; i <= 11; i++) {
      await addRecentAdres({ postcode: `${1000 + i}AB`, huisnummer: String(i) })
    }
    const adressen = await listRecenteAdressen()
    expect(adressen.map((a) => a.id)).not.toContain('1001AB 1')
  })

  it('bewaart de huisletter bij het adres', async () => {
    await addRecentAdres({ postcode: '1234AB', huisnummer: '42', huisletter: 'A' })
    const adressen = await listRecenteAdressen()
    expect(adressen[0].id).toBe('1234AB 42A')
  })
})
