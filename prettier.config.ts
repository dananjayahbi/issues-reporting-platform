import type { Options } from "prettier";

const prettierConfig: Options = {
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  quoteProps: "consistent",
  printWidth: 100,
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss"],
};

export default prettierConfig;
