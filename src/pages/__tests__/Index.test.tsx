import { render, screen, within } from '@testing-library/react'
import Index from '../Index'

describe('Index', () => {
  it('renders the main components', () => {
    render(<Index />)
    
    expect(screen.getByRole('heading', { 
      name: /git repository management/i,
      level: 1 
    })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument()
  })

  it('renders the feature grid', () => {
    render(<Index />)
    
    const featureGrid = screen.getByRole('region', { name: /features/i })
    expect(within(featureGrid).getByText(/features/i)).toBeInTheDocument()
    expect(within(featureGrid).getAllByRole('img')).toHaveLength(3)
  })

  it('renders the repo manager', () => {
    render(<Index />)
    
    const repoManager = screen.getByRole('region', { name: /repositories/i })
    expect(within(repoManager).getByText(/repositories/i)).toBeInTheDocument()
    expect(within(repoManager).getByRole('button', { name: /add repository/i })).toBeInTheDocument()
  })
})
