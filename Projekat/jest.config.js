module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.js',
  },
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // NAPOMENA: coverage se namjerno mjeri samo na ovom užem skupu fajlova,
  // pa prikazani postotak NIJE pokrivenost cijelog projekta. Pragovi ispod
  // vrijede za ovaj skup. Proširenje liste zahtijeva i ponovno kalibrisanje pragova.
  collectCoverageFrom: [
    'lib/validations/authValidation.ts',
    'services/auth/authService.ts',
    'app/api/auth/uloge/route.ts',
    'app/api/admin/users/route.ts',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 99,
      lines: 99,
      statements: 98,
    },
  },
};
