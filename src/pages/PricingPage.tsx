import type { View } from '../App'

interface Props {
  onNavigate: (view: View) => void
}

const tiers = [
  {
    name: 'Gratis',
    price: '€0',
    period: '/maand',
    description: '3 checks per maand',
    cta: 'Start gratis',
    ctaStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    popular: false,
    features: [
      { label: 'Checks per maand', value: '3' },
      { label: 'WWS puntentelling', included: true },
      { label: 'BAG-koppeling', included: true },
      { label: 'PDF rapport', included: false },
      { label: 'Optimalisatieadvies', included: false },
      { label: 'Meerdere adressen', included: false },
      { label: 'API-toegang', included: false },
      { label: 'Meerdere gebruikers', included: false },
    ],
  },
  {
    name: 'Starter',
    price: '€9,95',
    period: '/maand',
    description: '10 checks per maand',
    cta: 'Probeer 14 dagen gratis',
    ctaStyle: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    popular: false,
    features: [
      { label: 'Checks per maand', value: '10' },
      { label: 'WWS puntentelling', included: true },
      { label: 'BAG-koppeling', included: true },
      { label: 'PDF rapport', included: true },
      { label: 'Optimalisatieadvies', included: true },
      { label: 'Meerdere adressen', included: false },
      { label: 'API-toegang', included: false },
      { label: 'Meerdere gebruikers', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '€24,95',
    period: '/maand',
    description: 'Onbeperkt, alle 5 adressen',
    cta: 'Probeer 14 dagen gratis',
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    popular: true,
    features: [
      { label: 'Checks per maand', value: 'Onbeperkt' },
      { label: 'WWS puntentelling', included: true },
      { label: 'BAG-koppeling', included: true },
      { label: 'PDF rapport', included: true },
      { label: 'Optimalisatieadvies', included: true },
      { label: 'Meerdere adressen', value: 'Tot 5' },
      { label: 'API-toegang', included: false },
      { label: 'Meerdere gebruikers', included: false },
    ],
  },
  {
    name: 'Bureau',
    price: '€49,95',
    period: '/maand',
    description: 'Onbeperkt, multi-user, API',
    cta: 'Probeer 14 dagen gratis',
    ctaStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    popular: false,
    features: [
      { label: 'Checks per maand', value: 'Onbeperkt' },
      { label: 'WWS puntentelling', included: true },
      { label: 'BAG-koppeling', included: true },
      { label: 'PDF rapport', included: true },
      { label: 'Optimalisatieadvies', included: true },
      { label: 'Meerdere adressen', value: 'Tot 50' },
      { label: 'API-toegang', included: true },
      { label: 'Meerdere gebruikers', included: true },
    ],
  },
]

const faqs = [
  {
    q: 'Voldoet de WWS-check aan de Wet Betaalbare Huur (WBH)?',
    a: 'Ja. Onze puntentelling is gebaseerd op het Woningwaarderingsstelsel zoals van kracht per 1 juli 2024, inclusief de aanpassingen uit de Wet Betaalbare Huur. We updaten de berekening direct bij wijzigingen in de regelgeving.',
  },
  {
    q: 'Kan ik de uitkomst gebruiken als bewijs bij de Huurcommissie?',
    a: 'Het PDF-rapport (Starter, Pro en Bureau) bevat alle relevante gegevens inclusief BAG-informatie en energielabel. Dit rapport is geschikt als onderbouwing bij een procedure bij de Huurcommissie, maar vervangt geen officieel toetsingsbesluit.',
  },
  {
    q: 'Wat gebeurt er als de WBH-regelgeving verandert?',
    a: 'Alle abonnementen ontvangen automatisch de meest recente berekeningen. Bij ingrijpende wijzigingen sturen wij een notificatie per e-mail zodat u uw huurprijs tijdig kunt heroverwegen.',
  },
]

function Check() {
  return (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function PricingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Transparante tarieven</h1>
          <p className="text-lg text-gray-600">
            Kies het abonnement dat past bij uw verhuurportefeuille.
          </p>
        </div>

        {/* Pricing table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-sm border-2 flex flex-col ${
                tier.popular ? 'border-blue-600' : 'border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Meest populair
                  </span>
                </div>
              )}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500 text-sm">{tier.period}</span>
                </div>
              </div>
              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2 text-sm text-gray-700">
                      {'value' in f ? (
                        <>
                          <Check />
                          <span>
                            <span className="font-medium">{f.label}:</span> {f.value}
                          </span>
                        </>
                      ) : f.included ? (
                        <>
                          <Check />
                          <span>{f.label}</span>
                        </>
                      ) : (
                        <>
                          <Cross />
                          <span className="text-gray-400">{f.label}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => onNavigate('home')}
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Veelgestelde vragen over WBH-compliance
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('home')}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Terug naar home
          </button>
        </div>
      </div>
    </div>
  )
}
