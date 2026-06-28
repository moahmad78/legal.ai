import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LandingPage from './page'

// Removed clerk mock
describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />)
    const heading = screen.getByRole('heading', { name: /Understand Any Document in Seconds/i })
    expect(heading).toBeInTheDocument()
  })
})
