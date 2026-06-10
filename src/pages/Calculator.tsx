import { useState } from 'react'
import { berekenVerhuurcheck } from '../api/verhuurcheck'
import type { VerhuurCheckResultaat, VerhuurCheckInput } from '../api/verhuurcheck'

interface CalculatorProps {
  onResultaat: (res: VerhuurCheckResultaat, inp: VerhuurCheckInput) => void
  onBack: () => void
}

export default function Calculator({ onResultaat, onBack }: CalculatorProps) {
  const [postcode, setPostcode] = useState('')
  const [huisnummer, setHuisnummer] = useState('')
  const [huisletter, setHuisletter] = useState('')
  const [stap, setStap] = useState<1 | 2>(1)
  const [buitenruimte, setBuitenruimte] = useState(0)
  const [keuken, setKeuken] = useState<'basis' | 'luxe'>('basis')
  const [sanitair, setSanitair] = useState<'basis' | 'luxe'>('basis')
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  const handleAdresDoorgaan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postcode.trim() || !huisnummer.trim()) {
      setFout('Vul postcode en huisnummer in.')
      return
    }
    setFout(null)
    setStap(2)
  }

  const handleBereken = async (e: React.FormEvent) => {
    e.preventDefault()
    setFout(null)
    setLaden(true)
    const input: VerhuurCheckInput = {
      postcode: postcode.replace(/\s/g, '').toUpperCase(),
      huisnummer,
      ...(huisletter.trim() ? { huisletter: huisletter.trim() } : {}),
      buitenruimte_m2: buitenruimte,
      keuken,
      sanitair,
    }
    try {
      const res = await berekenVerhuurcheck(input)
      onResultaat(res, input)
    } catch (err) {
      setFout(err instanceof Error ? err.message : 'Er is een onbekende fout opgetreden.')
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-navy-900 text-white px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-blue-300 hover:text-white text-sm">← Terug</button>
        <span className="font-bold text-lg">Verhuurcheck<span className="text-blue-300">.nl</span></span>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Stap-indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${stap >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <span className="text-xs text-gray-500">Adres</span>
          </div>
          <div className={`flex-1 h-1 rounded mb-4 ${stap >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${stap >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className="text-xs text-gray-500">Details</span>
          </div>
        </div>

        {stap === 1 && (
          <form onSubmit={handleAdresDoorgaan} className="space-y-5">
            <h2 className="text-2xl font-bold text-navy-900">Voer het adres in</h2>
            <p className="text-gray-500 text-sm">Wij halen automatisch gegevens op uit BAG, energielabel en WOZ.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="1234 AB"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={7}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Huisnummer</label>
                <input
                  type="text"
                  value={huisnummer}
                  onChange={(e) => setHuisnummer(e.target.value)}
                  placeholder="42"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">Letter</label>
                <input
                  type="text"
                  value={huisletter}
                  onChange={(e) => setHuisletter(e.target.value)}
                  placeholder="A"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={2}
                />
              </div>
            </div>

            {fout && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{fout}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              Volgende →
            </button>
          </form>
        )}

        {stap === 2 && (
          <form onSubmit={handleBereken} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Verfijn uw berekening</h2>
              <p className="text-gray-500 text-sm mt-1">
                Adres: <span className="font-medium text-gray-700">{postcode} {huisnummer}{huisletter}</span>
                <button type="button" onClick={() => setStap(1)} className="ml-2 text-blue-500 hover:underline text-xs">Wijzigen</button>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buitenruimte: <span className="font-bold text-blue-600">{buitenruimte} m²</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={buitenruimte}
                onChange={(e) => setBuitenruimte(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0 m²</span><span>100 m²</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keuken kwaliteit</label>
              <div className="flex gap-3">
                {(['basis', 'luxe'] as const).map((opt) => (
                  <label key={opt} className={`flex-1 text-center py-3 rounded-lg border-2 cursor-pointer font-medium transition-colors ${keuken === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" className="sr-only" value={opt} checked={keuken === opt} onChange={() => setKeuken(opt)} />
                    {opt === 'basis' ? 'Standaard' : 'Luxe'}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sanitair kwaliteit</label>
              <div className="flex gap-3">
                {(['basis', 'luxe'] as const).map((opt) => (
                  <label key={opt} className={`flex-1 text-center py-3 rounded-lg border-2 cursor-pointer font-medium transition-colors ${sanitair === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" className="sr-only" value={opt} checked={sanitair === opt} onChange={() => setSanitair(opt)} />
                    {opt === 'basis' ? 'Standaard' : 'Luxe'}
                  </label>
                ))}
              </div>
            </div>

            {fout && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{fout}</p>}

            <button
              type="submit"
              disabled={laden}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-3"
            >
              {laden ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  BAG, energielabel en WOZ worden opgehaald...
                </>
              ) : (
                'Bereken WWS-punten →'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
