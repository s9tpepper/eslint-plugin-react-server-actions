# eslint-plugin-react-server-actions

Eslint plugin to help enforce `'use server'` in React Server Actions.
Checks if you have a `'use server'` at the top of your module file.
If no `'use server'` is found at top of file, it makes sure that there
is a `'use server'` at the top of each exported function in a module file.

## Installation
```
npm install --save-dev eslint-plugin-react-server-actions
```

## Configuration
```
// eslint.config.js

export default [
  {
    rules: {
      'react-server-actions/use-server': [
        'error',
        {
          // List directories where you have server actions
          actionsDir: ['src/actions'],
        },
      ],
    },
  },
]
```
