import { rule } from './rules/server-actions'

export const rules = {
  'use-server': rule,
}

export const configs = {
  recommended: {
    rules: {
      'react-server-actions/use-server': {
        actionsDir: ['src/actions'],
      },
    },
    plugins: {
      'react-server-actions': {
        rules,
        configs: {},
      },
    },
  },
}
