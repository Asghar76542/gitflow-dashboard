import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('d3', () => ({
  select: jest.fn(),
  scaleLinear: jest.fn(),
  axisBottom: jest.fn(),
  axisLeft: jest.fn()
}));

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});