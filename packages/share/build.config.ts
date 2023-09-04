import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/index'],
  externals: ['electron'],
  declaration: true,
  rollup: {
    emitCJS: true
  }
})
