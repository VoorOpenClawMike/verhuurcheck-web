import { render, screen } from '@testing-library/react'
import PricingPage from './PricingPage'

describe('test_pricing_page_rendert', () => {
  it('renders all four tier names', () => {
    render(<PricingPage onNavigate={() => {}} />)
    expect(screen.getByText('Gratis')).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Bureau')).toBeInTheDocument()
  })

  it('shows Meest populair badge on Pro tier', () => {
    render(<PricingPage onNavigate={() => {}} />)
    expect(screen.getByText('Meest populair')).toBeInTheDocument()
  })

  it('shows CTA buttons', () => {
    render(<PricingPage onNavigate={() => {}} />)
    expect(screen.getByText('Start gratis')).toBeInTheDocument()
    const proefButtons = screen.getAllByText('Probeer 14 dagen gratis')
    expect(proefButtons.length).toBeGreaterThan(0)
  })

  it('renders FAQ section with WBH compliance questions', () => {
    render(<PricingPage onNavigate={() => {}} />)
    expect(screen.getByText(/WBH-compliance/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Wet Betaalbare Huur/i).length).toBeGreaterThan(0)
  })
})
