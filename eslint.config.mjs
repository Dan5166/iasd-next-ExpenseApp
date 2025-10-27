import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // 👇 Añade estas líneas para evitar los warnings de Prisma
      "src/generated/prisma/**",
      "node_modules/.prisma/**",
      "**/generated/**", // por si Prisma genera en otra carpeta
    ],
  },
];

export default eslintConfig;
