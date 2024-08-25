import * as reactServerActions from '../dist/index.js'

export default [
  {
    rules: {
      'react-server-actions/use-server': [
        'error',
        {
          actionsDir: ['src/actions'],
        },
      ],
    },
    plugins: {
      'react-server-actions': reactServerActions,
    },
  },
]
