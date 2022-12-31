import fs from 'fs'
import { gzipSizeSync } from 'gzip-size'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const file = path.join(__dirname, 'dist', 'index.js')
const size = fs.statSync(file).size
const gzipped = gzipSizeSync(fs.readFileSync(file, 'utf8'))

const inKb = (bytes) => (bytes / 1024).toFixed(2)

const { log } = console
log(`✅ Built: ${inKb(size)}kb / ${inKb(gzipped)}kb gzipped`)
