import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WebMetricsForm from './WebMetricsForm';

describe('WebMetricsForm Component', () => {
  test('renders form and handles submission', async () => {
    const mockAnalyze = jest.fn();
    render(<WebMetricsForm onAnalyze={mockAnalyze} isLoading={false} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /Analyze/i });

    await userEvent.type(input, 'https://example.com');
    await userEvent.click(button);

    expect(mockAnalyze).toHaveBeenCalledWith('https://example.com');
  });

  test('shows loading state', () => {
    render(<WebMetricsForm onAnalyze={() => {}} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
