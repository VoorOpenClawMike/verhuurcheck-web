interface LandingPageProps {
  onStart: () => void
  onPricing: () => void
}

export default function LandingPage({ onStart, onPricing }: LandingPageProps) {
  const faqs = [
    {
      q: 'Wat zijn WWS-punten?',
      a: 'WWS staat voor Woningwaarderingsstelsel. Dit is een puntensysteem waarmee de kwaliteit van een huurwoning wordt beoordeeld. Elk kenmerk — zoals oppervlakte, energielabel en voorzieningen — levert punten op. Het totaal bepaalt de maximale huurprijs.',
    },
    {
      q: 'Hoe bereken ik de maximale huurprijs?',
      a: 'De maximale huurprijs wordt bepaald door het aantal WWS-punten van de woning. Vul het adres in op Verhuurcheck.nl en wij berekenen automatisch het puntentotaal op basis van BAG-data, energielabel en WOZ-waarde.',
    },
    {
      q: 'Wat is de Wet betaalbare huur?',
      a: 'De Wet betaalbare huur (2024) heeft het WWS verplicht gesteld voor sociale huurwoningen en uitgebreid naar het middensegment (tot 186 punten). Verhuurders zijn wettelijk verplicht zich aan de maximale huurprijs te houden.',
    },
    {
      q: 'Is mijn woning sociaal of vrije sector?',
      a: 'Tot 144 punten valt een woning in de sociale sector (max. €879/mnd in 2025). Van 145–186 punten is het middensegment (max. €1.157/mnd). Boven 186 punten is de woning vrije sector en geldt geen maximale huurprijs.',
    },
    {
      q: 'Wat kost een officieel huurprijsrapport?',
      a: 'Een indicatieve berekening is gratis. Een officieel, ondertekend PDF-rapport voor de huurcommissie of rechtbank kost €9,95 inclusief BTW.',
    },
  ]

  return (
    <div className="font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">Verhuurcheck<span className="text-blue-300">.nl</span></div>
        <div className="flex items-center gap-4">
          <button onClick={onPricing} className="text-blue-200 hover:text-white text-sm font-medium transition-colors min-h-[44px] inline-flex items-center px-2">
            Tarieven
          </button>
          <button
            onClick={onStart}
            className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors min-h-[44px]"
          >
            Bereken gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-blue-600/30 text-blue-200 text-sm font-medium px-4 py-1 rounded-full mb-6">
            Conform Wet Betaalbare Huur januari 2025
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Bereken uw maximale huurprijs<br />
            <span className="text-blue-300">in 30 seconden</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">
            Voer het adres in — wij halen automatisch BAG-data, energielabel en WOZ-waarde op en berekenen uw WWS-punten.
          </p>
          <button
            onClick={onStart}
            className="bg-blue-500 hover:bg-blue-400 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg transition-colors"
          >
            Start gratis berekening →
          </button>
          <p className="mt-4 text-blue-300 text-sm">Geen registratie vereist</p>
        </div>
      </section>

      {/* Voordelen */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-navy-900 mb-12">Waarom Verhuurcheck.nl?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏛️',
                title: 'Automatisch BAG-data',
                desc: 'Bouwjaar, oppervlakte en gebruiksdoel worden direct uit de Basisregistratie Adressen en Gebouwen opgehaald.',
              },
              {
                icon: '⚖️',
                title: 'Conform Wet Betaalbare Huur 2025',
                desc: 'Onze berekening volgt het officiële WWS inclusief de uitbreiding naar het middensegment.',
              },
              {
                icon: '📄',
                title: 'Officieel PDF-rapport',
                desc: 'Download een ondertekend rapport voor €9,95 — geldig als bewijs voor huurcommissie of rechtbank.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg text-navy-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-navy-900 mb-10">Veelgestelde vragen</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-white border border-gray-200 rounded-xl px-6 py-4 group"
              >
                <summary className="font-semibold text-navy-800 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-blue-500 group-open:rotate-180 transition-transform text-lg">▼</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-navy-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Klaar om te beginnen?</h2>
          <p className="text-blue-200 mb-8">Gratis indicatieve berekening. Direct resultaat.</p>
          <button
            onClick={onStart}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Start gratis berekening →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-navy-800 text-blue-300 text-sm text-center py-6 px-6">
        Verhuurcheck.nl — Onderdeel van FloorPlanGen | Indicatieve berekening
      </footer>
    </div>
  )
}
