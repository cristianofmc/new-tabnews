import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import pluginSecurity from "eslint-plugin-security";
import pluginSdl from "@microsoft/eslint-plugin-sdl";

import * as espree from "espree";

export default defineConfig([
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "infra/migrations/**",
      "package-lock.json",
    ],
  },

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },

  ...nextVitals,
  pluginSecurity.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      "@microsoft/sdl": pluginSdl,
    },
    rules: {
      ...pluginSdl.configs.recommended.rules,
    },
  },

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      parser: espree,
    },
    settings: {
      react: {
        version: "19.2",
      },
    },
  },

  {
    files: ["tests/**/*.test.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },

  {
    files: ["**/*.json"],
    ignores: ["package-lock.json"],
    language: "json/json",
    plugins: { json },
    extends: ["json/recommended"],
  },

  {
    files: ["**/*.md"],
    plugins: { markdown },
    extends: ["markdown/recommended"],
  },

  {
    files: ["**/*.css"],
    plugins: { css },
    extends: ["css/recommended"],
  },

  prettier,
]);
