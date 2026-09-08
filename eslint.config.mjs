import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "storage/**"],
  },
  {
    // Liens <a> assumés : téléchargements servis par des routes API
    // (`/api/admin/*/export`, PDF) et not-found global sans routeur — un
    // <Link> next/link n'a pas de sens pour ces cibles non-page.
    files: [
      "src/app/(admin)/**/*.tsx",
      "src/app/not-found.tsx",
      "src/components/admin/**/*.tsx",
    ],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
];

export default eslintConfig;
