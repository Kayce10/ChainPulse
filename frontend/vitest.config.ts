import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest configuration – ChainPulse
 *
 * Supports two modes driven by environment variables:
 *
 *   VITEST_SHARD      "1/4"  – run only this shard (for parallel CI jobs)
 *   VITEST_COVERAGE   "true" – enable coverage instrumentation
 *
 * CI jobs use these via:
 *   pnpm vitest run --coverage                 (coverage job)
 *   pnpm vitest run --shard=1/4                (shard job)
 */

const shardEnv  = process.env.VITEST_SHARD;   // e.g. "2/4"
const withCov   = process.env.VITEST_COVERAGE === 'true';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],

    // Pull every *.test / *.spec under src/
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Parallelism: use threads by default; CI overrides with --shard flag.
    pool: 'threads',
    poolOptions: {
      threads: {
        // Let vitest pick the worker count unless explicitly capped.
        maxThreads: process.env.CI ? 4 : undefined,
        minThreads: 1,
      },
    },

    // Shard support: parsed from VITEST_SHARD="index/count"
    ...(shardEnv
      ? (() => {
          const [index, count] = shardEnv.split('/').map(Number);
          return { shard: { index, count } };
        })()
      : {}),

    // Reporter: verbose in CI so every test name appears in the log.
    reporter: process.env.CI ? 'verbose' : 'default',

    // Coverage (enabled by --coverage CLI flag or VITEST_COVERAGE=true)
    coverage: {
      enabled: withCov,
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/node_modules/**',
        'src/__tests__/setup.ts',
        'src/**/*.stories.{ts,tsx}',
      ],
      // Enforced thresholds – the CI coverage job fails below these.
      thresholds: {
        lines:      70,
        functions:  70,
        branches:   70,
        statements: 70,
      },
      // Emit per-file coverage so Codecov can annotate PRs.
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
