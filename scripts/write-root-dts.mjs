import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const nested = path.join(dist, 'src', 'lib', 'index.d.ts')
if (!fs.existsSync(nested)) {
  console.error('Missing declaration bundle:', nested)
  process.exit(1)
}

fs.writeFileSync(path.join(dist, 'index.d.ts'), `export * from './src/lib/index'\n`)

const guideSrc = path.resolve('AI_USAGE_GUIDE.md')
const guideDest = path.join(dist, 'AI_USAGE_GUIDE.md')
if (fs.existsSync(guideSrc)) {
  fs.copyFileSync(guideSrc, guideDest)
} else {
  console.warn('AI_USAGE_GUIDE.md not found at repo root; dist will omit it.')
}
