// Polyfill for TextEncoder/TextDecoder (required for MSW in Node environment)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// MSW server setup is optional - only used for integration tests
// Our unit tests mock services directly with jest.mock()
try {
  const { server } = require('./__mocks__/server');
  // Establish API mocking before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  // Reset any request handlers that we may add during the tests
  afterEach(() => server.resetHandlers());
  // Clean up after the tests are finished
  afterAll(() => server.close());
} catch (e) {
  // MSW not available or not needed for these tests
  console.log('MSW server not initialized for these tests');
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.alert
global.alert = jest.fn();

// Mock window.confirm
global.confirm = jest.fn(() => true);
