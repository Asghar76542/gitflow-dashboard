
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('d3', () => ({
  select: jest.fn(),
  scaleLinear: jest.fn(),
  axisBottom: jest.fn(),
  axisLeft: jest.fn()
}));

describe('App Component', () => {
  test('renders repositories link', () => {
    render(<App />);
    const linkElement = screen.getByRole('link', { name: /Repositories/i });
    expect(linkElement).toBeInTheDocument();
  });

  test('renders web tools link', () => {
    render(<App />);
    const linkElement = screen.getByRole('link', { name: /Web Tools/i });
    expect(linkElement).toBeInTheDocument();
  });

  test('navigates between pages', async () => {
    render(<App />);
    
    // Click Web Tools link
    const webToolsLink = screen.getByRole('link', { name: /Web Tools/i });
    await userEvent.click(webToolsLink);
    
    // Verify Web Tools page content
    await waitFor(() => {
      expect(screen.getByText(/Web Performance Metrics/i)).toBeInTheDocument();
    });

    // Click Repositories link
    const reposLink = screen.getByRole('link', { name: /Repositories/i });
    await userEvent.click(reposLink);
    
    // Verify Repositories page content
    await waitFor(() => {
      expect(screen.getByText(/Repository Management/i)).toBeInTheDocument();
    });
  });

  test('renders loading state', () => {
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
