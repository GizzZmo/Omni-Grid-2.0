import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// jsdom 30.1+ throws `Cannot read properties of undefined (reading '_buffer')`
// from URL.createObjectURL(File). Stub object URLs for unit tests.
let objectUrlSeq = 0;
URL.createObjectURL = () => `blob:vitest/${++objectUrlSeq}`;
URL.revokeObjectURL = () => undefined;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup global test utilities
globalThis.expect = expect;
