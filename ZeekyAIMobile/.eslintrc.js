module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'eslint:recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-native',
  ],
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    // Disable some rules that might cause issues in mobile development
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'prettier/prettier': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
