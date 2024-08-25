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

const create = (context: Rule.RuleContext): Rule.RuleListener => {
  const { id, cwd, options, physicalFilename, filename, sourceCode } = context

  // id: react-server-actions/use-server
  // cwd: /Users/s9tpepper/code/web/eslint-react-server-actions/example
  // options: [{"actionsDir":["src/actions"]}]
  // physicalFilename: /Users/s9tpepper/code/web/eslint-react-server-actions/example/src/actions/bad-server-action.js
  // filename: /Users/s9tpepper/code/web/eslint-react-server-actions/example/src/actions/bad-server-action.js
  // sourceCode: [object Object]

  console.log(`id: ${id}`)
  console.log(`cwd: ${cwd}`)
  console.log(`options: ${JSON.stringify(options)}`)
  console.log(`physicalFilename: ${physicalFilename}`)
  console.log(`filename: ${filename}`)
  console.log(`sourceCode: ${sourceCode}`)

  // Get directory of server actions
  const serverActionsDirectories = options.map(
    (option) => `${cwd}/${option.actionsDir}`,
  )

  // Check if current file is in server actions directory
  let path = physicalFilename.split('/')
  path.pop()

  const currentFileDirectory = path.join('/')
  const isServerAction = serverActionsDirectories.includes(currentFileDirectory)

  let hasTopLevelUseServer = false
  if (isServerAction) {
    // Check if there is a 'use server' at top of file
    const code = sourceCode
      .getLines()
      .map((line) => {
        return line.trim()
      })
      .filter((line) => line.length > 0)

    hasTopLevelUseServer = /^['"]use server['"]/.test(code?.[0])
  }

  return {
    // AssignmentExpression(node) {
    //   console.log('AssignmentExpression: ===============')
    //   console.log(node)
    // },
    //
    // FunctionExpression(node) {
    //   console.log('FunctionExpression: ===============')
    //   console.log(node)
    // },
    //
    // MethodDefinition(node) {
    //   console.log('MethodDefinition: ===============')
    //   console.log(node)
    // },
    //
    // ExportSpecifier(node) {
    //   console.log('ExportSpecifier: ===============')
    //   console.log(node)
    // },
    //
    // ExpressionStatement(node) {
    //   console.log('ExpressionStatement: ===============')
    //   console.log(node)
    //
    //   const expression = node.expression as Expression & {
    //     callee?: Identifier
    //     arguments?: Array<Expression | SpreadElement>
    //   }
    //   if (!expression.callee) {
    //     return
    //   }
    //
    //   // if (
    //   //   expression.callee &&
    //   //   // isClientOnlyHook(expression.callee.name) &&
    //   //   // Boolean(util.getParentComponent(expression))
    //   // ) {
    //   //   instances.push(expression.callee.name)
    //   //   reportMissingDirective('addUseClientHooks', expression.callee, {
    //   //     hook: expression.callee.name,
    //   //   })
    //   // }
    // },

    onCodePathStart(codePath, node): void {
      const _d = debug.extend('onCodePathStart')

      _d(`hasTopLevelUseServer: ${hasTopLevelUseServer}`)

      if (hasTopLevelUseServer) {
        _d('Has top level "use server", no checks required')
        return
      }

      _d('onCodePathStart: ===============')
      if (
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'FunctionExpression'
      ) {
        if (node.body.type === 'BlockStatement') {
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

          if (literals.length === 0) {
            _d('Bailing, no literals found')

            // Should report here
            _d(
              'Make a report to the context, no "use server" found in this arrow function expression',
            )

            const message =
              'Arrow function statement is missing "use server" directive'
            const report: Rule.ReportDescriptor = { node, message }
            context.report(report)

            return
          }

          const hasUseServer = literals[0].value === 'use server'

          if (!hasUseServer) {
            // report this to the context
            _d('Report this statement as a problem')
          }
        }
      }
    },
  }
}

export const rule: Rule.RuleModule = {
  meta,
  create,
}
