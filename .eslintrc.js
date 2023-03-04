module.exports = {
    root: true,
    ignorePatterns: [
        ".eslintrc.js",
        ".prettierrc.js",
        "node_modules/",
        "packages/**/dist"
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ],
    rules: {},
    overrides: [
      {
        files: ["*.ts"],
        rules: {
          "@typescript-eslint/explicit-function-return-type": [
            "error",
            { allowExpressions: true }
          ]
        }
      }
    ]
};