import { useState } from 'react'
import type { VerhuurCheckResultaat, VerhuurCheckInput } from '../api/verhuurcheck'

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
  const wws = resultaat.wws
  const segment = SEGMENT_CONFIG[wws.segment] ?? SEGMENT_CONFIG.vrij

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#0f1f52] text-white px-6 py-4 flex items-center gap-4">
        <button onClick={onNieuw} className="text-blue-300 hover:text-white text-sm">
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
              <span
                className={`inline-block text-white font-extrabold text-lg px-3 py-1 rounded-lg ${ENERGIELABEL_KLEUREN[resultaat.energielabel] ?? 'bg-gray-400'}`}
              >
                {resultaat.energielabel}
              </span>
              {!resultaat.energielabel_geldig && (
                <p className="text-xs text-orange-500 mt-1">Label verlopen</p>
              )}
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

        {/* Downloadknoppen */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadIndicatie}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            📄 Download indicatie (gratis)
          </button>
          <button
            disabled
            className="flex-1 bg-blue-600 opacity-60 text-white font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
            title="Beschikbaar in sprint 4"
          >
            📋 Officieel rapport €9,95
          </button>
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
