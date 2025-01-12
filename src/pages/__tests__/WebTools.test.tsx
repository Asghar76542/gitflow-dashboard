import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WebTools from '../WebTools'

describe('WebTools', () => {
  it('renders the main components', () => {
    render(<WebTools />)
    
    expect(screen.getByText('Web Development Tools')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /website url/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument()
  })

  it('shows loading state when analyzing', async () => {
    render(<WebTools />)
    const input = screen.getByRole('textbox', { name: /website url/i })
    const button = screen.getByRole('button', { name: /analyze/i })

    await userEvent.type(input, 'https://example.com')
    userEvent.click(button)

    expect(button).toBeDisabled()
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument()
  })

  it('displays metrics after analysis', async () => {
    render(<WebTools />)
    const input = screen.getByRole('textbox', { name: /website url/i })
    const button = screen.getByRole('button', { name: /analyze/i })

    await userEvent.type(input, 'https://example.com')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Page Load Time')).toBeInTheDocument()
      expect(screen.getByText('2.3s')).toBeInTheDocument()
    })
  })

  it('shows error in console when analysis fails', async () => {
    // Mock a failing API call
    jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<WebTools />)
    const input = screen.getByRole('textbox', { name: /website url/i })
    const button = screen.getByRole('button', { name: /analyze/i })

    await userEvent.type(input, 'invalid-url')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
