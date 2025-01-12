import { render, screen } from '@testing-library/react';
import { RepositoryList } from './RepositoryList';
import { Repository } from '@/types/repository';

const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'repo1',
    url: 'https://example.com/repo1',
    is_master: true,
    branches: [],
    default_branch: 'main'
  },
  {
    id: '2',
    name: 'repo2',
    url: 'https://example.com/repo2',
    is_master: false,
    branches: [],
    default_branch: 'main'
  }
];

describe('RepositoryList Component', () => {
  test('renders repository list', () => {
    render(
      <RepositoryList
        repositories={mockRepositories}
        onToggleMaster={() => {}}
        onRefresh={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText('https://example.com/repo1')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/repo2')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <RepositoryList
        repositories={[]}
        onToggleMaster={() => {}}
        onRefresh={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        isLoading={true}
      />
    );

    // Since we're using the disabled prop on buttons when loading
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});