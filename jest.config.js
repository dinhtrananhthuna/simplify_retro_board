const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Đường dẫn tới Next.js app
  dir: './',
})

// Custom Jest configuration
const customJestConfig = {
  // Thêm setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapping cho absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
    '!src/app/globals.css',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
  ],
  
  // Transform patterns để ignore node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(socket.io|socket.io-client)/)',
  ],
}

module.exports = createJestConfig(customJestConfig) 