import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '.git/**', '**/coverage/**', '.eslintrc.cjs']
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,jsx,ts,tsx,mts,cts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        module: 'readonly'
      },
      parser: vueParser,
      parserOptions: {
        parser: parserTypeScript,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
      vue: pluginVue
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  }
]
