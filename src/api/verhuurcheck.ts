export interface VerhuurCheckInput {
  postcode: string
  huisnummer: string
  huisletter?: string
  buitenruimte_m2?: number
  keuken?: 'basis' | 'luxe'
  sanitair?: 'basis' | 'luxe'
}

export interface VerhuurCheckResultaat {
  adres_volledig: string | null
  bouwjaar: number | null
  oppervlakte_m2: number | null
  energielabel: string | null
  energielabel_geldig: boolean
  woz_waarde_eur: number | null
  wws: {
    punten_totaal: number
    punten_detail: Record<string, number>
    segment: 'sociaal' | 'midden' | 'vrij'
    max_huur_eur: number | null
    berekeningsdatum: string
  }
  data_volledigheid: number
  ontbrekende_data: string[]
  error: string | null
}

const API_BASE = 'https://api.floorplangen.jarvisops.online'

export async function berekenVerhuurcheck(
  input: VerhuurCheckInput
): Promise<VerhuurCheckResultaat> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/verhuurcheck/volledig`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error(
      'Kan geen verbinding maken met de server. Controleer uw internetverbinding en probeer het opnieuw.'
    )
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Adres niet gevonden. Controleer de postcode en het huisnummer.')
    }
    if (response.status >= 500) {
      throw new Error('De server is tijdelijk niet beschikbaar. Probeer het over een moment opnieuw.')
    }
    throw new Error(`Er is een fout opgetreden (${response.status}). Probeer het opnieuw.`)
  }

  const data: VerhuurCheckResultaat = await response.json()

  if (data.error) {
    throw new Error(data.error)
  }

  return data
}
