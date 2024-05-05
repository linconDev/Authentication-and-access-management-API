module.exports = {
  moduleNameMapper: {
    '^@logger/(.*)$': '<rootDir>/common/logger/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/main.ts', '!**/*module.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
