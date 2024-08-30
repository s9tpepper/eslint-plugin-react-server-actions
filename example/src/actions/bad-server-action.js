'use server'

export const goodServerAction = async () => {
  'use server'

  return 'some good stuff'
}

export const someServerActionExpression = async function() {
  return 'some stuff'
}

export const someServerAction = async () => {
  return 'some stuff'
}

export function someFuncExpression() {
  return 'some things'
}

class SomeClass {
  anAction() {
    return 'hello'
  }

  anotherAction = () => {
    return 'something else'
  }

  get something() {
    return 'hi'
  }
}
const someClassInstance = new SomeClass()

export const anAction = someClassInstance.anAction
