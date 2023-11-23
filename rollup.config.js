// rollup.config.js
import { readFileSync } from 'node:fs'

import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import parseJson from 'parse-json'

const pkg = parseJson(readFileSync('./package.json', 'utf-8'))

export default {
  input: './bin/cli.ts',
  plugins: [typescript({ tsconfig: './tsconfig.json' }), nodeResolve(), commonjs()],
  output: {
    banner: '#!/usr/bin/env node',
    format: 'esm',
    dir: './dist',
    preserveModules: true,
  },
  external: [
    ...Object.keys(pkg.devDependencies),
    ...Object.keys(pkg.dependencies),
    'vue/compiler-sfc',
  ],
  watch: {
    exclude: ['./node_modules/**', './dist/**'],
  },
}
