import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    server: {
      deps: {
        inline: ['vitest-package-exports'],
      },
    },
    include: ['test/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
