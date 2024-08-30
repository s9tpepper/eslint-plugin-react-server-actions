import { Rule } from 'eslint'
// @ts-ignore
import 'json-circular-stringify'
// @ts-ignore
import Debug from 'debug'

import { ExpressionStatement, SimpleLiteral } from 'estree'

const debug = Debug('eslint-react-server-actions')

const meta: Rule.RuleMetaData = {
  type: 'problem',

  hasSuggestions: true,

  docs: {
    description: 'Description of rule goes here',
  },

  schema: {
    type: 'array',

    items: [
      {
        type: 'object',
        properties: {
          actionsDir: { type: 'array', items: [{ type: 'string' }] },
        },
        additionalProperties: false,
      },
    ],

    additionalItems: false,
  },
}

type FunctionTypes =
  | 'ArrowFunctionExpression'
  | 'FunctionExpression'
  | 'FunctionDeclaration'

const getUseServerErrorMessage = (type: FunctionTypes): string => {
  let message = 'Function is missing "use server" directive'
  if (type === 'ArrowFunctionExpression') {
    message = 'Arrow function expression is missing "use server" directive'
  } else if (type === 'FunctionExpression') {
    message = 'Function expression is missing "use server" directive'
  } else if (type === 'FunctionDeclaration') {
    message = 'Function declaration is missing "use server" directive'
  }

  return message
}

const create = (context: Rule.RuleContext): Rule.RuleListener => {
  const __d = debug.extend('create')
  const { cwd, options, physicalFilename, sourceCode } = context

  __d(`options: ${JSON.stringify(options, null, 2)}`)
  __d(`cwd: ${cwd}`)
  __d(`physicalFilename: "${physicalFilename}"`)

  // Get directory of server actions
  const serverActionsDirectories = options.map(
    (option) => `${cwd}/${option.actionsDir}`,
  )
  __d(`serverActionsDirectories: ${serverActionsDirectories}`)

  // Check if current file is in server actions directory
  let path = physicalFilename.split('/')
  path.pop()

  const shouldCheckInput = options.some((option) => {
    __d(`option: ${JSON.stringify(option)}`)
    const isInput = option.actionsDir.includes('<input>')
    __d(`isInput: ${isInput}`)

    return isInput
  })
  const fileIsInput = physicalFilename === '<input>'

  __d(`path: ${path}`)
  __d(`fileIsInput': ${fileIsInput}`)
  __d(`shouldCheckInput: ${shouldCheckInput}`)

  const currentFileDirectory = path.join('/')
  const isServerAction =
    serverActionsDirectories.includes(currentFileDirectory) ||
    (fileIsInput && shouldCheckInput)
  __d(`isServerAction: ${isServerAction}`)

  let hasTopLevelUseServer = false
  if (isServerAction) {
    __d('Checking top level...')
    // Check if there is a 'use server' at top of file
    const code = sourceCode
      .getLines()
      .map((line) => {
        return line.trim()
      })
      .filter((line) => line.length > 0)

    __d(`code?.[0]: ${code?.[0]}`)

    hasTopLevelUseServer = /^['"]use server['"]/.test(code?.[0])
    __d(`hasTopLevelUseServer: ${hasTopLevelUseServer}`)
  }

  return {
    onCodePathStart(_codePath, node): void {
      const _d = debug.extend('onCodePathStart')
      _d('Running onCodePathStart...')

      if (hasTopLevelUseServer) {
        _d('Has top level "use server", no checks required')
        return
      }

      _d(`node.type: ${node.type}`)

      if (
        node.type !== 'ArrowFunctionExpression' &&
        node.type !== 'FunctionExpression' &&
        node.type !== 'FunctionDeclaration'
      ) {
        return
      }

      _d(`node.body.type: ${node.body.type}`)
      if (node.body.type === 'ObjectExpression' && !hasTopLevelUseServer) {
        const report: Rule.ReportDescriptor = {
          node,
          message: getUseServerErrorMessage(node.type),
        }
        context.report(report)

        return
      }

      if (node.body.type !== 'BlockStatement') {
        return
      }

      _d('Checking BlockStatement...')
      const literals: SimpleLiteral[] = node.body.body
        .filter((item) => {
          const isExpression = item.type === 'ExpressionStatement'
          if (!isExpression) return false

          const isLiteral = item.expression.type === 'Literal'

          return isExpression && isLiteral
        })
        .map((item) => {
          return item as ExpressionStatement
        })
        .map((item) => {
          return item.expression as SimpleLiteral
        })
      _d(`Found ${literals.length} SimpleLiteral expressions`)

      const hasUseServer = literals?.[0]?.value === 'use server'
      if (!hasTopLevelUseServer && !hasUseServer) {
        // report this to the context
        _d('Report this statement as a problem')
        const report: Rule.ReportDescriptor = {
          node,
          message: getUseServerErrorMessage(node.type),
        }
        context.report(report)

        return
      }
    },
  }
}

export const rule: Rule.RuleModule = {
  meta,
  create,
}
