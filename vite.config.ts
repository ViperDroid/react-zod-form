import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isLib = process.env.BUILD_LIB === '1'

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react-hook-form',
  'zod',
]

function isExternal(id: string) {
  if (external.includes(id)) return true
  if (id.startsWith('@hookform/resolvers')) return true
  return false
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isLib
      ? [
          dts({
            tsconfigPath: './tsconfig.lib.json',
            outDir: 'dist',
            entryRoot: 'src',
            insertTypesEntry: true,
            rollupTypes: false,
            include: ['src/lib/**/*', 'src/components/**/*'],
            exclude: ['**/*.test.ts', '**/*.test.tsx', 'src/test/**'],
          }),
        ]
      : []),
  ],
  build: isLib
    ? {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          name: 'ReactZodFormBuilder',
          formats: ['es', 'cjs'],
          fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.js'),
        },
        emptyOutDir: true,
        copyPublicDir: false,
        rollupOptions: {
          external: isExternal,
          output: {
            exports: 'named',
            assetFileNames: (assetInfo) => {
              if (assetInfo.names?.some((n) => n.endsWith('.css'))) return 'style.css'
              if (assetInfo.name?.endsWith('.css')) return 'style.css'
              return 'assets/[name]-[hash][extname]'
            },
          },
        },
      }
    : {
        outDir: 'dist-demo',
      },
})
