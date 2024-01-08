/* eslint-env node */
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  rules: {
    "quotes": ["warn", "double"],
    "indent": ["error", 2],
    "space-before-function-paren": ["error", {
      "asyncArrow": "always",
      "anonymous": "never",
      "named": "never"
    }],
    "no-unused-vars": "off",
    "max-len": ["warn", { "code": 120 }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
};