import { RuleTester } from 'eslint'
import { rule } from './server-actions'

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
  },
})

describe('use server', () => {
  ruleTester.run('react-server-actions', rule, {
    valid: [
      {
        code: '"use server"\nexport const someFunc = () => { return {hello: "world"} }',
        options: [{ actionsDir: ['<input>'] }],
      },
      {
        code: 'export const someFunc = () => { "use server"\nreturn {hello: "world"} }',
        options: [{ actionsDir: ['<input>'] }],
      },
      {
        code: 'export function someFunc () { "use server"\nreturn {hello: "world"} }',
        options: [{ actionsDir: ['<input>'] }],
      },
      {
        code: 'export const someFunc = function () { "use server"\nreturn {hello: "world"} }',
        options: [{ actionsDir: ['<input>'] }],
      },
    ],
    invalid: [
      {
        code: 'export const someFunc = () => { return {hello: "world"} }',
        output: null,
        errors: 1,
        options: [{ actionsDir: ['<input>'] }],
      },
      {
        code: 'export function someFunc () { return {hello: "world"} }',
        output: null,
        errors: 1,
        options: [{ actionsDir: ['<input>'] }],
      },
      {
        code: 'export const someFunc = function () { return {hello: "world"} }',
        output: null,
        errors: 1,
        options: [{ actionsDir: ['<input>'] }],
      },
      {
        code: 'export const someFunc = () => ({hello: "world"})',
        output: null,
        errors: 1,
        options: [{ actionsDir: ['<input>'] }],
      },
    ],
  })
})
