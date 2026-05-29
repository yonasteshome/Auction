/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended", "prettier", "turbo"],

  plugins: ["unicorn", "check-file"],

  rules: {
    // Enforce kebab-case for FILES
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",

        // Important exceptions
        ignore: [
          "^README.md$",
          "^LICENSE$",
          "^tsconfig.json$",
          "^next.config.js$",
          "^postcss.config.js$",

          // Next.js special files
          "^page.tsx$",
          "^layout.tsx$",
          "^route.ts$",
          "^loading.tsx$",
          "^error.tsx$",

          // Allow React components (optional)
          "^[A-Z].*\\.tsx$"
        ],
      },
    ],

    // Enforce kebab-case for FOLDERS
    "check-file/folder-naming-convention": [
      "error",
      {
        "**/*/": "KEBAB_CASE",
      },
    ],
  },
};