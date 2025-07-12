import shopifyEslintPlugin from '@shopify/eslint-plugin';

const shopifyConfig = [
  ...shopifyEslintPlugin.configs.typescript,
  ...shopifyEslintPlugin.configs['typescript-type-checking'],
  ...shopifyEslintPlugin.configs.react,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@shopify/strict-component-boundaries': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-process-env': 'off',
      'react/react-in-jsx-scope': 'off',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/default': 'off',
      'import/namespace': 'off',
    },
  },
];

export default shopifyConfig;
