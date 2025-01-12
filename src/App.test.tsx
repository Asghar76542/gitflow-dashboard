
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  test('renders repositories link', () => {
    renderApp();
    const linkElement = screen.getByRole('link', { name: /Repositories/i });
    expect(linkElement).toBeInTheDocument();
  });

  test('renders web tools link', () => {
    renderApp();
    const linkElement = screen.getByRole('link', { name: /Web Dev Tools/i });
    expect(linkElement).toBeInTheDocument();
  });

  test('navigates between pages', async () => {
    renderApp();
    
    // Click Web Tools link
    const webToolsLink = screen.getByRole('link', { name: /Web Dev Tools/i });
    await userEvent.click(webToolsLink);
    
    // Verify Web Tools page content
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Web Development Tools/i })).toBeInTheDocument();
    });

    // Click Repositories link
    const reposLink = screen.getByRole('link', { name: /Repositories/i });
    await userEvent.click(reposLink);
    
    // Verify Repositories page content
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Git Repository Manager/i })).toBeInTheDocument();
    });
  });

  test('renders sidebar toggle button on mobile', () => {
    renderApp();
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveClass('md:hidden');
  });
});
