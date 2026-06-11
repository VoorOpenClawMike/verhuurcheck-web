import { useState, useEffect } from 'react'
import type { VerhuurCheckResultaat, VerhuurCheckInput } from '../api/verhuurcheck'

const PAYMENT_API = 'https://api.floorplangen.jarvisops.online'

interface VerduurzamingMaatregel {
  maatregel: string
  kosten_na_subsidie: number
  labelsprong: number
  nieuw_label: string
  puntenwinst: number
  huurwinst_per_jaar: number
  terugverdientijd_jaar: number | null
}

const MAATREGEL_NAMEN: Record<string, string> = {
  spouwmuurisolatie: 'Spouwmuurisolatie',
  dakisolatie: 'Dakisolatie',
  vloerisolatie: 'Vloerisolatie',
  hr_glas: 'HR++ glas',
  warmtepomp: 'Warmtepomp',
  zonnepanelen_6: 'Zonnepanelen (6 stuks)',
  zonneboiler: 'Zonneboiler',
}

interface ResultaatProps {
  resultaat: VerhuurCheckResultaat
  input: VerhuurCheckInput
  onNieuw: () => void
}

const ENERGIELABEL_KLEUREN: Record<string, string> = {
  'A+++': 'bg-green-600',
  'A++': 'bg-green-600',
  'A+': 'bg-green-500',
  A: 'bg-green-400',
  B: 'bg-lime-400 text-gray-800',
  C: 'bg-yellow-400 text-gray-800',
  D: 'bg-orange-400',
  E: 'bg-orange-500',
  F: 'bg-red-500',
  G: 'bg-red-600',
}

const SEGMENT_CONFIG: Record<string, { label: string; kleur: string }> = {
  sociaal: { label: 'Sociaal segment', kleur: 'bg-green-100 text-green-800 border-green-200' },
  midden: { label: 'Middensegment', kleur: 'bg-orange-100 text-orange-800 border-orange-200' },
  vrij: { label: 'Vrije sector', kleur: 'bg-blue-100 text-blue-800 border-blue-200' },
}

function formatEuro(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(bedrag)
}

export default function Resultaat({ resultaat, input, onNieuw }: ResultaatProps) {
  const [puntentabelOpen, setPuntentabelOpen] = useState(false)
  const [roiOpen, setRoiOpen] = useState(false)
  const [roiData, setRoiData] = useState<VerduurzamingMaatregel[] | null>(null)
  const [roiLoading, setRoiLoading] = useState(false)
  const [betaalEmail, setBetaalEmail] = useState('')
  const [betaalLoading, setBetaalLoading] = useState(false)
  const wws = resultaat.wws
  const segment = SEGMENT_CONFIG[wws.segment] ?? SEGMENT_CONFIG.vrij

  useEffect(() => {
    if (roiOpen && roiData === null && resultaat.energielabel && !roiLoading) {
      setRoiLoading(true)
      fetch('https://api.floorplangen.jarvisops.online/verhuurcheck/verduurzaming-roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          huidig_label: resultaat.energielabel,
          huidig_wws_punten: wws.punten_totaal,
          huidig_max_huur: wws.max_huur_eur,
          woningtype: 'appartement',
        }),
      })
        .then(r => r.json())
        .then(d => { setRoiData(d.maatregelen ?? []); setRoiLoading(false) })
        .catch(() => { setRoiData([]); setRoiLoading(false) })
    }
  }, [roiOpen])

  const downloadIndicatie = () => {
    const lines = [
      'VERHUURCHECK.NL — INDICATIEVE BEREKENING',
      '=========================================',
      `Adres: ${resultaat.adres_volledig ?? `${input.postcode} ${input.huisnummer}${input.huisletter ?? ''}`}`,
      `Berekeningsdatum: ${wws.berekeningsdatum}`,
      '',
      `WWS-punten totaal: ${wws.punten_totaal}`,
      `Segment: ${segment.label}`,
      `Maximale huurprijs: ${wws.max_huur_eur != null ? formatEuro(wws.max_huur_eur) + '/mnd' : 'Vrije sector'}`,
      '',
      'PUNTENVERDELING',
      '---------------',
      ...Object.entries(wws.punten_detail).map(([cat, pts]) => `${cat}: ${pts}`),
      '',
      'Indicatieve berekening conform Wet Betaalbare Huur januari 2025.',
      'Raadpleeg een jurist of huurcommissie voor zekerheid.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'verhuurcheck-indicatie.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
  const startBetaling = async () => {
    if (!betaalEmail) { alert('Vul uw e-mailadres in.'); return }
    setBetaalLoading(true)
    try {
      const res = await fetch(`${PAYMENT_API}/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: input.postcode,
          huisnummer: input.huisnummer,
          email: betaalEmail,
        }),
      })
      if (!res.ok) throw new Error('mislukt')
      const { checkout_url } = await res.json()
      window.location.href = checkout_url
    } catch {
      alert('Betaling starten mislukt. Probeer opnieuw.')
      setBetaalLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#0f1f52] text-white px-6 py-4 flex items-center gap-4">
        <button onClick={onNieuw} className="text-blue-300 hover:text-white text-sm min-h-[44px] inline-flex items-center">
          ← Nieuwe berekening
        </button>
        <span className="font-bold text-lg">
          Verhuurcheck<span className="text-blue-300">.nl</span>
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Data-volledigheid banner */}
        {resultaat.data_volledigheid < 75 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex gap-3 items-start">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Sommige gegevens ontbreken</p>
              <p className="text-yellow-700 text-sm mt-0.5">
                Voeg energielabel of WOZ toe voor een nauwkeuriger berekening.
                {resultaat.ontbrekende_data.length > 0 &&
                  ` Ontbrekend: ${resultaat.ontbrekende_data.join(', ')}.`}
              </p>
            </div>
          </div>
        )}

        {/* Hoofdresultaat */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-4">
            {resultaat.adres_volledig ??
              `${input.postcode} ${input.huisnummer}${input.huisletter ?? ''}`}
          </p>

          {/* Punten-cirkel */}
          <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-[#0f1f52] text-white mb-5 shadow-lg">
            <div>
              <div className="text-4xl font-extrabold leading-none">{wws.punten_totaal}</div>
              <div className="text-xs text-blue-300 mt-1">WWS-punten</div>
            </div>
          </div>

          {/* Segment badge */}
          <div className="mb-4">
            <span
              className={`inline-block border rounded-full px-4 py-1.5 text-sm font-semibold ${segment.kleur}`}
            >
              {segment.label}
            </span>
          </div>

          {/* Max huurprijs */}
          <div className="text-3xl font-extrabold text-[#0f1f52]">
            {wws.max_huur_eur != null
              ? `max. ${formatEuro(wws.max_huur_eur)}/mnd`
              : 'Vrije sector'}
          </div>
          <p className="text-gray-400 text-xs mt-1">Berekend op {wws.berekeningsdatum}</p>
        </div>

        {/* Data-kaartjes */}
        <div className="grid sm:grid-cols-3 gap-4">
          {(resultaat.bouwjaar || resultaat.oppervlakte_m2) && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Woning
              </p>
              {resultaat.bouwjaar && (
                <p className="text-sm text-gray-700">
                  Bouwjaar: <span className="font-semibold">{resultaat.bouwjaar}</span>
                </p>
              )}
              {resultaat.oppervlakte_m2 && (
                <p className="text-sm text-gray-700">
                  Oppervlakte: <span className="font-semibold">{resultaat.oppervlakte_m2} m²</span>
                </p>
              )}
            </div>
          )}

          {resultaat.energielabel && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Energielabel
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center justify-center text-white font-extrabold text-2xl w-12 h-12 rounded-xl shadow-sm ${ENERGIELABEL_KLEUREN[resultaat.energielabel] ?? 'bg-gray-400'}`}
                >
                  {resultaat.energielabel}
                </span>
                <div className="flex flex-col gap-0.5">
                  {resultaat.energie_label_bron === 'ep_online' && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 font-medium">
                      EP-Online
                    </span>
                  )}
                  {resultaat.energie_label_bron === 'altum_ai' && (
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 font-medium">
                      Altum AI
                    </span>
                  )}
                  {!resultaat.energielabel_geldig && (
                    <span className="text-xs text-orange-500">Verlopen</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {resultaat.woz_waarde_eur && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                WOZ-waarde
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatEuro(resultaat.woz_waarde_eur)}
              </p>
            </div>
          )}
        </div>

        {/* Puntentabel accordion */}
        {Object.keys(wws.punten_detail).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPuntentabelOpen(!puntentabelOpen)}
              className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[#0f1f52] hover:bg-gray-50 transition-colors"
            >
              Puntenverdeling per categorie
              <span
                className={`transition-transform text-blue-500 ${puntentabelOpen ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>
            {puntentabelOpen && (
              <div className="border-t border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-2 text-gray-500 font-medium">Categorie</th>
                      <th className="text-right px-5 py-2 text-gray-500 font-medium">Punten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(wws.punten_detail).map(([cat, pts], i) => (
                      <tr key={cat} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="px-5 py-2 text-gray-700">{cat}</td>
                        <td className="px-5 py-2 text-right font-semibold text-[#1e3070]">{pts}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-200 bg-blue-50">
                      <td className="px-5 py-3 font-bold text-[#0f1f52]">Totaal</td>
                      <td className="px-5 py-3 text-right font-extrabold text-[#0f1f52]">
                        {wws.punten_totaal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Verduurzaming ROI accordion */}
        {resultaat.energielabel && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setRoiOpen(!roiOpen)}
              className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[#0f1f52] hover:bg-gray-50 transition-colors"
            >
              Verduurzaming — terugverdientijd per maatregel
              <span className={`transition-transform text-blue-500 ${roiOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {roiOpen && (
              <div className="border-t border-gray-100">
                {roiLoading && (
                  <p className="text-sm text-gray-400 text-center py-6">Berekening laden…</p>
                )}
                {!roiLoading && roiData && roiData.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">Geen maatregelen beschikbaar</p>
                )}
                {!roiLoading && roiData && roiData.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-medium">
                        <th className="text-left px-5 py-2">Maatregel</th>
                        <th className="text-right px-5 py-2">Kosten (na subsidie)</th>
                        <th className="text-right px-5 py-2">Label</th>
                        <th className="text-right px-5 py-2">Terugverdientijd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiData.map((m, i) => (
                        <tr key={m.maatregel} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                          <td className="px-5 py-2 text-gray-700">{MAATREGEL_NAMEN[m.maatregel] ?? m.maatregel}</td>
                          <td className="px-5 py-2 text-right">{formatEuro(m.kosten_na_subsidie)}</td>
                          <td className="px-5 py-2 text-right font-semibold">
                            {m.labelsprong > 0 ? (
                              <span className={`inline-block px-2 py-0.5 rounded text-white text-xs ${ENERGIELABEL_KLEUREN[m.nieuw_label] ?? 'bg-gray-400'}`}>
                                {m.nieuw_label}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-5 py-2 text-right text-[#0f1f52] font-semibold">
                            {m.terugverdientijd_jaar != null ? `${m.terugverdientijd_jaar} jr` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <p className="text-xs text-gray-400 px-5 py-3">
                  Terugverdientijd via huurstijging door labelsprong. Exclusief energiebesparingen en comfortwinst.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Downloadknoppen */}
        <div className="flex flex-col gap-3">
          <button
            onClick={downloadIndicatie}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            📄 Download indicatie (gratis)
          </button>

          {/* Betaald rapport */}
          <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#0f1f52]">📋 Download volledig rapport</p>
              <span className="text-blue-600 font-bold">€9,95</span>
            </div>
            <p className="text-xs text-gray-500">
              Inclusief officiële WWS-puntentelling, energielabel, WOZ en verduurzamingsadvies als PDF.
            </p>
            <input
              type="email"
              placeholder="Uw e-mailadres"
              value={betaalEmail}
              onChange={e => setBetaalEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={startBetaling}
              disabled={betaalLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {betaalLoading ? 'Doorsturen…' : '💳 Betalen via iDEAL — €9,95'}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center leading-relaxed px-4">
          Indicatieve berekening conform Wet Betaalbare Huur januari 2025. Raadpleeg een jurist of
          huurcommissie voor zekerheid.
        </p>
      </div>
    </div>
  )
}
