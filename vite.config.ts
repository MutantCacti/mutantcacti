import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkEmDash from './src/plugins/remarkEmDash'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { enforce: 'pre' as const, ...mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkEmDash],
    }) },
    react({ include: /\.(jsx?|tsx?|mdx?)$/ }),
    tailwindcss(),
  ],
})
