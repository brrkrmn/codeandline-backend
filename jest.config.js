/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  "globalTeardown": "./tests/teardown.ts",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  "testTimeout": 100000
};