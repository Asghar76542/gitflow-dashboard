import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebMetricsForm } from './WebMetricsForm';

describe('WebMetricsForm Component', () => {
  const mockAnalyze = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<WebMetricsForm onAnalyze={mockAnalyze} isLoading={false} />);
    
    expect(screen.getByPlaceholderText(/enter website url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<WebMetricsForm onAnalyze={mockAnalyze} isLoading={false} />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://example.com');
    await userEvent.click(button);

    expect(mockAnalyze).toHaveBeenCalledWith('https://example.com');
  });

  it('validates URL input', async () => {
    render(<WebMetricsForm onAnalyze={mockAnalyze} isLoading={false} />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'invalid-url');
    await userEvent.click(button);

    expect(mockAnalyze).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<WebMetricsForm onAnalyze={mockAnalyze} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });
});