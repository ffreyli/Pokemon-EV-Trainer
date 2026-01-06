import { render } from '@testing-library/react';
import App from './App';

// Mock axios with interceptors for test environment
jest.mock('axios', () => {
  const mockAxios = {
    interceptors: {
      request: {
        use: jest.fn(() => 1), // Return an interceptor ID
        eject: jest.fn()
      },
      response: {
        use: jest.fn(() => 1),
        eject: jest.fn()
      }
    },
    get: jest.fn(() => Promise.resolve({ data: { user: null } })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  };
  return mockAxios;
});

test('renders App without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});
