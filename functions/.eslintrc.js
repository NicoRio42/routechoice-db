module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "quote-props": 0,
    quotes: ["error", "double"],
    "linebreak-style": 0,
    sourceType: 0,
  },
};
