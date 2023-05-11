import type { Options } from 'tsup'

export default <Options>{
  entryPoints: [
    'src/index.ts',
  ],
  external: ['lodash'],
  clean: true,
  format: ['cjs', 'esm', 'iife'],
  dts: true,
}
