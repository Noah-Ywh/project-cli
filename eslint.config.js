import eslintJS from '@eslint/js'

import typescriptEslintParser from '@typescript-eslint/parser'
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'

import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  /** 全局忽略 */
  {
    ignores: ['changelog.config.js', 'commitlint.config.js', '**/dist/'],
  },

  /** eslint 默认规则 */
  eslintJS.configs.recommended,

  /** @typescript-eslint 规则 */
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: typescriptEslintParser,
      sourceType: 'module',
    },
    plugins: { '@typescript-eslint': typescriptEslintPlugin },
    rules: typescriptEslintPlugin.configs.recommended.rules,
  },

  /** prettier 默认规则 */
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: eslintPluginPrettierRecommended.rules,
  },

  /** 自定义规则 */
  {
    rules: {
      curly: ['error', 'multi-line'],
      camelcase: 'error',
      eqeqeq: 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'accessor-pairs': 'warn',
      'consistent-return': 'warn',
      'default-case': 'error',
      'dot-location': ['error', 'property'],
      'linebreak-style': ['error', 'unix'],
      'no-var': 'error',
      'no-alert': 'warn',
      'no-else-return': 'warn',
      'no-empty-function': 'warn',
      'no-empty-pattern': 'warn',
      'no-template-curly-in-string': 'warn',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',

      'constructor-super': 'off', // ts(2335) & ts(2377)
      'getter-return': 'off', // ts(2378)
      'no-const-assign': 'off', // ts(2588)
      'no-dupe-args': 'off', // ts(2300)
      'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
      'no-dupe-keys': 'off', // ts(1117)
      'no-func-assign': 'off', // ts(2630)
      'no-import-assign': 'off', // ts(2632) & ts(2540)
      'no-new-native-nonconstructor': 'off', // ts(7009)
      'no-obj-calls': 'off', // ts(2349)
      'no-redeclare': 'off', // ts(2451)
      'no-setter-return': 'off', // ts(2408)
      'no-this-before-super': 'off', // ts(2376) & ts(17009)
      'no-undef': 'off', // ts(2304) & ts(2552)
      'no-unreachable': 'off', // ts(7027)
      'no-unsafe-negation': 'off', // ts(2365) & ts(2322) & ts(2358)
    },
  },
]
