import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WebTools from '../WebTools';
import { act } from 'react-dom/test-utils';

// Mock the toast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('WebTools Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all main components', () => {
    render(<WebTools />);
    
    expect(screen.getByText('Web Development Tools')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    expect(screen.getByText('Live Monitoring')).toBeInTheDocument();
  });

  it('handles website analysis', async () => {
    render(<WebTools />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://example.com');
    await userEvent.click(button);

    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Page Load Time')).toBeInTheDocument();
      expect(screen.getByText('2.3s')).toBeInTheDocument();
    });
  });

  it('toggles monitoring state', async () => {
    render(<WebTools />);
    
    const monitoringSwitch = screen.getByRole('switch', { name: /toggle monitoring/i });
    expect(screen.getByText('Inactive')).toBeInTheDocument();

    await userEvent.click(monitoringSwitch);
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Test monitoring interval
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(screen.getByText(/health check performed/i)).toBeInTheDocument();
  });

  it('displays console logs', async () => {
    render(<WebTools />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://example.com');
    await userEvent.click(button);

    await waitFor(() => {
      const logs = screen.getByText(/analyzing https:\/\/example.com/i);
      expect(logs).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    // Mock a failing analysis
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<WebTools />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'invalid-url');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});