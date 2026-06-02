import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Minimal Vitest config. Its only job is to resolve the `@/` path alias (the
 * same one tsconfig.json defines) so tests can import server route handlers /
 * modules that use `@/lib/...`. All other Vitest defaults are intentionally
 * left untouched (node environment, default include globs).
 */
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
