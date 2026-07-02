import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'store-backend/vendor',
    'store-backend/public/build',
    'store-backend/storage',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: [
      'src/components/ui/Accordion.jsx',
      'src/components/ui/AlertDialog.jsx',
      'src/components/ui/Popover.jsx',
      'src/components/ui/Sheet.jsx',
      'src/components/ui/Tabs.jsx',
      'src/components/ui/Tooltip.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
