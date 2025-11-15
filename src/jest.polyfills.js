// Polyfill for TextEncoder/TextDecoder (required for MSW in Node environment)
// This file must run BEFORE setupTests.js to ensure polyfills are available
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;