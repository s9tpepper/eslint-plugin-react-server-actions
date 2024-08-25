// src/rules/server-actions.ts
import "json-circular-stringify";
import Debug from "debug";
var debug = Debug("eslint-react-server-actions");
var meta = {
  type: "problem",
  hasSuggestions: true,
  docs: {
    description: "Description of rule goes here"
  },
  schema: {
    type: "array",
    items: [
      {
        type: "object",
        properties: {
          actionsDir: { type: "array", items: [{ type: "string" }] }
        },
        additionalProperties: false
      }
    ],
    additionalItems: false
  }
};
var create = (context) => {
  const { id, cwd, options, physicalFilename, filename, sourceCode } = context;
  console.log(`id: ${id}`);
  console.log(`cwd: ${cwd}`);
  console.log(`options: ${JSON.stringify(options)}`);
  console.log(`physicalFilename: ${physicalFilename}`);
  console.log(`filename: ${filename}`);
  console.log(`sourceCode: ${sourceCode}`);
  const serverActionsDirectories = options.map(
    (option) => `${cwd}/${option.actionsDir}`
  );
  let path = physicalFilename.split("/");
  path.pop();
  const currentFileDirectory = path.join("/");
  const isServerAction = serverActionsDirectories.includes(currentFileDirectory);
  let hasTopLevelUseServer = false;
  if (isServerAction) {
    const code = sourceCode.getLines().map((line) => {
      return line.trim();
    }).filter((line) => line.length > 0);
    hasTopLevelUseServer = /^['"]use server['"]/.test(code?.[0]);
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
    onCodePathStart(codePath, node) {
      const _d = debug.extend("onCodePathStart");
      _d(`hasTopLevelUseServer: ${hasTopLevelUseServer}`);
      if (hasTopLevelUseServer) {
        _d('Has top level "use server", no checks required');
        return;
      }
      _d("onCodePathStart: ===============");
      if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression") {
        if (node.body.type === "BlockStatement") {
          const literals = node.body.body.filter((item) => {
            const isExpression = item.type === "ExpressionStatement";
            if (!isExpression) return false;
            const isLiteral = item.expression.type === "Literal";
            return isExpression && isLiteral;
          }).map((item) => {
            return item;
          }).map((item) => {
            return item.expression;
          });
          _d(`Found ${literals.length} SimpleLiteral expressions`);
          if (literals.length === 0) {
            _d("Bailing, no literals found");
            _d(
              'Make a report to the context, no "use server" found in this arrow function expression'
            );
            const message = 'Arrow function statement is missing "use server" directive';
            const report = { node, message };
            context.report(report);
            return;
          }
          const hasUseServer = literals[0].value === "use server";
          if (!hasUseServer) {
            _d("Report this statement as a problem");
          }
        }
      }
    }
    // onCodePathEnd(codePath, node) {
    //   console.log('onCodePathEnd: ===============')
    //   // console.log(node)
    // },
    //
    // onCodePathSegmentStart(segment, node) {
    //   console.log('onCodePathSegmentStart: ===============')
    //   // console.log(node)
    // },
    //
    // onCodePathSegmentEnd(segment, node) {
    //   console.log('onCodePathSegmentEnd: ===============')
    //   // console.log(node)
    // },
    //
    // onCodePathSegmentLoop(fromSegment, toSegment, node) {
    //   console.log('onCodePathSegmentLoop: ===============')
    //   // console.log(node)
    // },
    // [key: string]:
    //     | ((codePath: CodePath, node: Node) => void)
    //     | ((segment: CodePathSegment, node: Node) => void)
    //     | ((fromSegment: CodePathSegment, toSegment: CodePathSegment, node: Node) => void)
    //     | ((node: Node) => void)
    //     | NodeListener[keyof NodeListener]
    //     | undefined;
  };
};
var rule = {
  meta,
  create
};

// src/index.ts
var rules = {
  "use-server": rule
};
var configs = {
  recommended: {
    rules: {
      "react-server-actions/use-server": {
        actionsDir: ["src/actions"]
      }
    },
    plugins: {
      "react-server-actions": {
        rules,
        configs: {}
      }
    }
  }
};
export {
  configs,
  rules
};
