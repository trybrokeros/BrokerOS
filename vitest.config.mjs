import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/*.{test,spec}.ts',
      'integrations/**/*.{test,spec}.ts',
      'apps/**/test/e2e/**/*.{test,spec}.ts',
    ],
    alias: {
      '@brokeros/constants': path.resolve(import.meta.dirname, './packages/constants/src'),
      '@brokeros/validators': path.resolve(import.meta.dirname, './packages/validators/src'),
      '@brokeros/types': path.resolve(import.meta.dirname, './packages/types/src'),
      '@brokeros/prisma': path.resolve(import.meta.dirname, './packages/prisma/src'),
      '@brokeros/int-voice': path.resolve(import.meta.dirname, './integrations/voice/index.ts'),
      '@brokeros/int-whatsapp': path.resolve(import.meta.dirname, './integrations/whatsapp/src/index.ts'),
    },
  },
});
