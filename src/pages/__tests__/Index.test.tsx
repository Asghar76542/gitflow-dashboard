import { render, screen } from '@testing-library/react'
import Index from '../Index'

describe('Index', () => {
  it('renders the main components', () => {
    render(<Index />)
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/git tools dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument()
  })

  it('renders the feature grid', () => {
    render(<Index />)
    
    expect(screen.getByText(/features/i)).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(3) // Assuming 3 feature icons
  })

  it('renders the repo manager', () => {
    render(<Index />)
    
    expect(screen.getByText(/repositories/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add repository/i })).toBeInTheDocument()
  })
})
