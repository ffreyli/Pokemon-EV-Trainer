// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock axios globally for all tests
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
