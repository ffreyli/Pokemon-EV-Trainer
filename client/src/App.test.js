import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Pokemon EV Trainer', () => {
  render(<App />);
  const headingElement = screen.getByText(/pokemon ev trainer/i);
  expect(headingElement).toBeInTheDocument();
});
