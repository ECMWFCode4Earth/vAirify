// jest.config.ts
const testUrl = 'https://test.com'

export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta', // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
              options: {
                metaObjectReplacement: {
                  env: {
                    VITE_AIR_QUALITY_API_URL: testUrl,
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__ mocks __/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
    "^.+.(vert|frag|glsl)$": "jest-transform-stub"
  },
  testPathIgnorePatterns: ['/node_modules/', '/system_tests/'],
  setupFiles: ['./jest.setup.ts'],
}
