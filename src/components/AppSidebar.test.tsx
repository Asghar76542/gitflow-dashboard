import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider } from './ui/sidebar';

describe('AppSidebar', () => {
  const renderSidebar = () => {
    return render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );
  };

  it('renders the sidebar with git tools navigation', () => {
    renderSidebar();
    
    expect(screen.getByText('Git Tools')).toBeInTheDocument();
    expect(screen.getByText('Repositories')).toBeInTheDocument();
    expect(screen.getByText('Push Operations')).toBeInTheDocument();
    expect(screen.getByText('Pull Requests')).toBeInTheDocument();
    expect(screen.getByText('Merge')).toBeInTheDocument();
  });

  it('has accessible navigation landmarks', () => {
    renderSidebar();
    
    const nav = screen.getByRole('navigation', { name: 'Git Tools' });
    expect(nav).toBeInTheDocument();
  });

  it('toggles collapsed state when collapse button is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar();
    
    const collapseButton = screen.getByRole('button', { name: /collapse/i });
    await user.click(collapseButton);
    
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  });

  it('maintains proper focus order during navigation', async () => {
    const user = userEvent.setup();
    renderSidebar();
    
    const firstLink = screen.getByRole('link', { name: 'Repositories' });
    const secondLink = screen.getByRole('link', { name: 'Push Operations' });
    
    await user.tab();
    expect(firstLink).toHaveFocus();
    
    await user.tab();
    expect(secondLink).toHaveFocus();
  });

  it('handles keyboard navigation correctly', async () => {
    const user = userEvent.setup();
    renderSidebar();
    
    const firstLink = screen.getByRole('link', { name: 'Repositories' });
    firstLink.focus();
    
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'Push Operations' })).toHaveFocus();
  });

  it('renders correctly in mobile view', () => {
    window.innerWidth = 480;
    window.dispatchEvent(new Event('resize'));
    
    renderSidebar();
    
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('mobile');
  });

  it('closes on overlay click in mobile view', async () => {
    window.innerWidth = 480;
    window.dispatchEvent(new Event('resize'));
    
    const user = userEvent.setup();
    renderSidebar();
    
    const overlay = screen.getByRole('button', { name: /close/i });
    await user.click(overlay);
    
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveAttribute('data-state', 'closed');
  });
});
