import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The repo also ships an upstream Next.js scaffold at `--template/` —
    // it has its own Next build output (`--template/.next/**`) and is not
    // app source. Lint should ignore it everywhere, not just at the root.
    "--template/**",
    // Editorial research and CSV exports from Search Console must not be
    // linted.
    "SEO/**",
    "graphify-out/**",
  ]),
  {
    // The codebase uses literal `'` / `"` in JSX text content intentionally.
    // The stylistic rule produces 130+ noisy errors with no a11y impact and
    // would otherwise hide real lint issues. Disable it explicitly with a
    // documented reason rather than escaping every apostrophe by hand.
    rules: {
      "react/no-unescaped-entities": "off",
      // Pre-existing `any` usage in extractors / scamScorer / urlRisk is
      // not part of this SEO pass. Keep visibility as a warning so new
      // additions are flagged in PRs, but don't block lint.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
