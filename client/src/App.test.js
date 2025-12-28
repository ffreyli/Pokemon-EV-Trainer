import { render } from '@testing-library/react';
import App from './App';

// Mock axios to handle ES module compatibility with Jest
jest.mock('axios');

test('renders App without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});
