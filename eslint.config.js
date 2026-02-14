// eslint.config.js
const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");

module.exports = defineConfig([
  {
    ignores: ["backend/venv/**", "dist/**", ".expo/**"],
  },
  expo,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
]);
