import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: ['dist', 'node_modules', 'unpackage', 'components/cc-threeJs/**']
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        uni: 'readonly',
        wx: 'readonly',
        plus: 'readonly',
        module: 'readonly',
        console: 'readonly',
        exports: 'readonly'
      }
    }
  },
  {
    files: ['components/cc-threeJs/**'],
    rules: {
      'no-redeclare': 'off',
      'no-dupe-args': 'off'
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2020
      },
      globals: {
        uni: 'readonly',
        wx: 'readonly',
        plus: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      vue: vuePlugin
    },
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020
      },
      globals: {
        uni: 'readonly',
        wx: 'readonly',
        plus: 'readonly',
        console: 'readonly'
      }
    }
  }
]