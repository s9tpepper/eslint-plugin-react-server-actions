"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  configs: () => configs,
  rules: () => rules
});
module.exports = __toCommonJS(src_exports);

// src/rules/server-actions.ts
var import_json_circular_stringify = require("json-circular-stringify");
var import_debug = __toESM(require("debug"), 1);
var debug = (0, import_debug.default)("eslint-react-server-actions");
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
  const { cwd, options, physicalFilename, sourceCode } = context;
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
    onCodePathStart(_codePath, node) {
      const _d = debug.extend("onCodePathStart");
      if (hasTopLevelUseServer) {
        _d('Has top level "use server", no checks required');
        return;
      }
      let message = 'Function is missing "use server" directive';
      if (node.type === "ArrowFunctionExpression") {
        message = 'Arrow function expression is missing "use server" directive';
      } else if (node.type === "FunctionExpression") {
        message = 'Function expression is missing "use server" directive';
      } else if (node.type === "FunctionDeclaration") {
        message = 'Function declaration is missing "use server" directive';
      }
      if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression" || node.type === "FunctionDeclaration") {
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
            if (!hasTopLevelUseServer) {
              const report = { node, message };
              context.report(report);
              return;
            }
          }
          const hasUseServer = literals[0].value === "use server";
          if (!hasTopLevelUseServer && !hasUseServer) {
            _d("Report this statement as a problem");
            const report = { node, message };
            context.report(report);
            return;
          }
        }
      }
    }
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configs,
  rules
});
