import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import Calculator from './pages/Calculator'
import Resultaat from './pages/Resultaat'
import PricingPage from './pages/PricingPage'
import type { VerhuurCheckResultaat, VerhuurCheckInput } from './api/verhuurcheck'

export type View = 'home' | 'calculator' | 'resultaat' | 'pricing'

function App() {
  const [view, setView] = useState<View>('home')
  const [resultaat, setResultaat] = useState<VerhuurCheckResultaat | null>(null)
  const [input, setInput] = useState<VerhuurCheckInput | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'home' && (
        <LandingPage onStart={() => setView('calculator')} onPricing={() => setView('pricing')} />
      )}
      {view === 'calculator' && (
        <Calculator
          onResultaat={(res, inp) => {
            setResultaat(res)
            setInput(inp)
            setView('resultaat')
          }}
          onBack={() => setView('home')}
        />
      )}
      {view === 'resultaat' && resultaat && input && (
        <Resultaat
          resultaat={resultaat}
          input={input}
          onNieuw={() => {
            setResultaat(null)
            setInput(null)
            setView('calculator')
          }}
        />
      )}
      {view === 'pricing' && (
        <PricingPage onNavigate={setView} />
      )}
    </div>
  )
}

export default App
