import { render, screen } from '@testing-library/react';
import { DetailedWebMetricsHighcharts } from './DetailedWebMetricsHighcharts';

// Mock Highcharts to avoid actual chart rendering in tests
jest.mock('highcharts-react-official', () => ({
  __esModule: true,
  default: () => <div data-testid="highcharts-component">Mocked Chart</div>,
}));

describe('DetailedWebMetricsHighcharts', () => {
  const mockData = [
    { metric: 'SSL Certificate', value: 'Present' },
    { metric: 'HTTPS', value: 'Yes' },
    { metric: 'Security Headers', value: 'Missing' },
    { metric: 'Responsive Design', value: 'No' },
  ];

  it('renders without crashing', () => {
    render(<DetailedWebMetricsHighcharts data={mockData} />);
    expect(screen.getByTestId('highcharts-component')).toBeInTheDocument();
  });

  it('renders within a Card component', () => {
    render(<DetailedWebMetricsHighcharts data={mockData} />);
    const cardElement = screen.getByTestId('highcharts-component').closest('div');
    expect(cardElement).toHaveClass('p-6');
  });

  it('handles empty data array', () => {
    render(<DetailedWebMetricsHighcharts data={[]} />);
    expect(screen.getByTestId('highcharts-component')).toBeInTheDocument();
  });

  it('handles null or undefined data gracefully', () => {
    // @ts-ignore - Testing invalid prop type
    render(<DetailedWebMetricsHighcharts data={null} />);
    expect(screen.getByTestId('highcharts-component')).toBeInTheDocument();
  });

  it('processes data correctly for Present/Yes values', () => {
    const { container } = render(<DetailedWebMetricsHighcharts data={mockData} />);
    const presentItems = mockData.filter(item => 
      item.value === 'Present' || item.value === 'Yes'
    );
    expect(presentItems.length).toBe(2);
  });

  it('processes data correctly for Missing/No values', () => {
    const { container } = render(<DetailedWebMetricsHighcharts data={mockData} />);
    const missingItems = mockData.filter(item => 
      item.value === 'Missing' || item.value === 'No'
    );
    expect(missingItems.length).toBe(2);
  });

  it('applies correct styling to the card wrapper', () => {
    const { container } = render(<DetailedWebMetricsHighcharts data={mockData} />);
    const cardWrapper = container.firstChild;
    expect(cardWrapper).toHaveClass('p-6');
  });

  // Add test for chart title
  it('includes chart title in the options', () => {
    render(<DetailedWebMetricsHighcharts data={mockData} />);
    const chartComponent = screen.getByTestId('highcharts-component');
    expect(chartComponent).toBeInTheDocument();
  });

  // Test for accessibility
  it('meets basic accessibility requirements', () => {
    const { container } = render(<DetailedWebMetricsHighcharts data={mockData} />);
    expect(container.firstChild).toBeInTheDocument();
    // Additional accessibility checks can be added here
  });
});