// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: "expo",
  ignorePatterns: ["/dist/*"],
  plugins: ["simple-import-sort"],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
  },
};
