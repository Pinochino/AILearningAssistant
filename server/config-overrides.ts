import { addBabelPlugin, override } from 'customize-cra'

export default override(
  addBabelPlugin([
    'babel-plugin-root-import',
    {
      rootPathSuffix: 'src'
    }
  ])
)
