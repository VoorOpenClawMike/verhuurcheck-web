import { useEffect, useState } from 'react'

const PAYMENT_API = 'https://api.floorplangen.jarvisops.online'

interface RapportProps {
  token: string
  onHome: () => void
}

export default function Rapport({ token, onHome }: RapportProps) {
  const [loading, setLoading] = useState(true)
  const [paid, setPaid] = useState(false)
  const [postcode, setPostcode] = useState('')
  const [huisnummer, setHuisnummer] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetch(`${PAYMENT_API}/payment/status?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => {
        setPaid(d.paid)
        setPostcode(d.postcode ?? '')
        setHuisnummer(d.huisnummer ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  const downloadPdf = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`${PAYMENT_API}/verhuurcheck/rapport-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode, huisnummer, rapport_token: token }),
      })
      if (!res.ok) throw new Error('mislukt')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `verhuurcheck-${postcode}-${huisnummer}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('PDF downloaden mislukt. Probeer opnieuw.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#0f1f52] text-white px-6 py-4 flex items-center gap-4">
        <button onClick={onHome} className="text-blue-300 hover:text-white text-sm">
          ← Terug
        </button>
        <span className="font-bold text-lg">
          Verhuurcheck<span className="text-blue-300">.nl</span>
        </span>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        {loading && (
          <p className="text-gray-500">Betaalstatus controleren…</p>
        )}

        {!loading && paid && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm space-y-6">
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-extrabold text-[#0f1f52]">Betaling geslaagd</h1>
            <p className="text-gray-600">
              Uw rapport voor <span className="font-semibold">{postcode} {huisnummer}</span> is klaar.
            </p>
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {downloading ? 'Downloaden…' : '📋 Download volledig rapport (PDF)'}
            </button>
          </div>
        )}

        {!loading && !paid && (
          <div className="bg-white rounded-2xl border border-red-200 p-10 shadow-sm space-y-6">
            <div className="text-5xl">❌</div>
            <h1 className="text-2xl font-extrabold text-gray-800">Betaling niet gevonden</h1>
            <p className="text-gray-500 text-sm">
              De betaling is nog niet afgerond of het token is ongeldig.
            </p>
            <button
              onClick={onHome}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              ← Terug naar begin
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
