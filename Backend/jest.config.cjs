module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  collectCoverageFrom: [
    "controller/**/*.js",
    "routes/**/*.js",
    "models/**/*.js",
    "!**/node_modules/**",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  // Each test file gets a fresh module registry so DB state doesn't bleed
  resetModules: false,
  testTimeout: 30000,
  verbose: true,
  bail: false,
  // Run serially to avoid concurrent Atlas writes colliding
  maxWorkers: 1,
};
