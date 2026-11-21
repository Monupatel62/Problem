const eslintConfig = [
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'jsx-a11y/alt-text': 'off',
      'react/no-unescaped-entities': 'off',
      'prefer-const': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/content/**/starter-code/**',
    ],
  },
];

export default eslintConfig;
