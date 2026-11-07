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
    ".next-daily/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone design mockups: not part of the app build.
    "design-mockups/**",
  ]),
  {
    // Tests transpile app modules into a VM context, where a CommonJS
    // `module` object is the harness, not a browser global.
    files: ["tests/**/*.mjs"],
    rules: { "@next/next/no-assign-module-variable": "off" },
  },
]);

export default eslintConfig;
