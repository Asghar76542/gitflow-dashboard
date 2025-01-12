import { render, screen } from '@testing-library/react';
import RepositoryList from './RepositoryList';
import { Repository } from '../../../types/repository';

const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'repo1',
    url: 'https://example.com/repo1',
    is_master: true,
    branches: [],
    default_branch: 'main',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'repo2',
    url: 'https://example.com/repo2',
    is_master: false,
    branches: [],
    default_branch: 'main',
    created_at: '2024-01-02'
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

    expect(screen.getByText('repo1')).toBeInTheDocument();
    expect(screen.getByText('repo2')).toBeInTheDocument();
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

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
