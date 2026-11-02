//
// This is only a SKELETON file for the 'Forth' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

// ---------- Constantes ----------

const TOKEN_TYPE = Object.freeze({
  NUMBER: 'Number',
  NAME: 'Name',
  BEGIN_DEFINITION: 'BeginDefinition',
  END_DEFINITION: 'EndDefinition',
  EOF: 'EOF',
})

const RE_WHITESPACE = /^\s+/
const RE_NUMBER = /^-?\d+/
const RE_NAME = /^([a-zA-Z][a-zA-Z0-9_-]*|\+|-|\*|\/)/

// ---------- Classe principal ----------

export class Forth {
  constructor() {
    this._stack = []
    this._symbols = createBuiltinSymbols()
  }

  /**
   * Interpreta o programa. O estado (stack e tabela de símbolos)
   * é mantido entre chamadas.
   */
  evaluate(program) {
    if (program.length === 0) return

    let position = 0
    while (true) {
      const token = this.getToken(program, position)

      switch (token.type) {
        case TOKEN_TYPE.NAME:
        case TOKEN_TYPE.NUMBER:
          position = token.end
          evaluateToken(this._stack, this._symbols, token)
          break

        case TOKEN_TYPE.BEGIN_DEFINITION:
          position = token.end
          position = this.parseDefinition(program, position)
          break

        case TOKEN_TYPE.END_DEFINITION:
          throw new Error('Unexpected end of definition')

        case TOKEN_TYPE.EOF:
          return
      }
    }
  }

  get stack() {
    return this._stack
  }

  /**
   * Tokeniza a partir de `start`. Retorna um objeto
   * { type, value, start, end }.
   */
  getToken(text, start) {
    let index = start

    while (index < text.length) {
      const remaining = text.substring(index)

      const wsMatch = RE_WHITESPACE.exec(remaining)
      if (wsMatch) {
        index += wsMatch[0].length
        continue
      }

      const numberToken = this._matchNumber(text, index, remaining)
      if (numberToken) return numberToken

      const punctToken = this._matchPunctuation(text, index)
      if (punctToken) return punctToken

      const nameToken = this._matchName(text, index, remaining)
      if (nameToken) return nameToken

      throw new Error(`Unrecognized token at ${index}`)
    }

    return { type: TOKEN_TYPE.EOF, value: '', start: index, end: index }
  }

  _matchNumber(text, index, remaining) {
    const match = RE_NUMBER.exec(remaining)
    if (!match) return null
    return {
      type: TOKEN_TYPE.NUMBER,
      value: Number(match[0]),
      start: index,
      end: index + match[0].length,
    }
  }

  _matchPunctuation(text, index) {
    if (text[index] === ':') {
      return {
        type: TOKEN_TYPE.BEGIN_DEFINITION,
        value: ':',
        start: index,
        end: index + 1,
      }
    }
    if (text[index] === ';') {
      return {
        type: TOKEN_TYPE.END_DEFINITION,
        value: ';',
        start: index,
        end: index + 1,
      }
    }
    return null
  }

  _matchName(text, index, remaining) {
    const match = RE_NAME.exec(remaining)
    if (!match) return null
    return {
      type: TOKEN_TYPE.NAME,
      value: match[0],
      start: index,
      end: index + match[0].length,
    }
  }

  /**
   * Lê uma definição `: nome ... ;` a partir de `index`
   * (que deve apontar logo após o `:`). Registra o novo símbolo
   * e retorna a posição após o `;`.
   */
  parseDefinition(program, index) {
    const nameToken = this.getToken(program, index)
    if (nameToken.type !== TOKEN_TYPE.NAME) {
      throw new Error('Invalid definition')
    }

    const name = nameToken.value
    let position = nameToken.end
    const bodyTokens = []

    let token = this.getToken(program, position)
    while (token.type !== TOKEN_TYPE.END_DEFINITION) {
      if (token.type === TOKEN_TYPE.EOF) {
        throw new Error('Unexpected end of file')
      }
      bodyTokens.push(token)
      position = token.end
      token = this.getToken(program, position)
    }

    // `lookback` restringe a busca ao estado da tabela no momento
    // da definição — evita recursão infinita em redefinições.
    const lookback = this._symbols.length - 1

    this._symbols.push({
      name: name.toLowerCase(),
      value: (stack) => evaluateTokens(stack, this._symbols, bodyTokens, lookback),
    })

    return token.end
  }
}

// ---------- Tabela de símbolos embutidos ----------

function createBuiltinSymbols() {
  return [
    { name: '+', value: add },
    { name: '-', value: subtract },
    { name: '*', value: multiply },
    { name: '/', value: divide },
    { name: 'dup', value: dup },
    { name: 'drop', value: drop },
    { name: 'swap', value: swap },
    { name: 'over', value: over },
  ]
}

// ---------- Utilidades de stack ----------

/**
 * Garante que a stack tenha `required` operandos; lança erro caso contrário.
 */
function assertStackHas(stack, required = 2) {
  if (stack.length === 0) {
    throw new Error('Stack empty')
  }
  if (stack.length === 1 && required === 2) {
    throw new Error('Only one value on the stack')
  }
}

// ---------- Resolução de símbolos ----------

/**
 * Busca um nome na tabela de símbolos, começando em `lookback`
 * (ou no final, se `null`), iterando de trás para frente.
 * Retorna a função associada ou `null`.
 */
function findName(symbols, name, lookback = null) {
  const target = name.toLowerCase()
  const begin = lookback ?? symbols.length - 1
  for (let i = begin; i >= 0; i--) {
    if (symbols[i].name === target) return symbols[i].value
  }
  return null
}

// ---------- Avaliação ----------

function evaluateToken(stack, symbols, token, lookback = null) {
  switch (token.type) {
    case TOKEN_TYPE.NUMBER:
      stack.push(token.value)
      break

    case TOKEN_TYPE.NAME: {
      const fn = findName(symbols, token.value, lookback)
      if (fn === null) throw new Error('Unknown command')
      fn(stack)
      break
    }
  }
}

function evaluateTokens(stack, symbols, tokens, lookback = null) {
  for (const token of tokens) {
    evaluateToken(stack, symbols, token, lookback)
  }
}

// ---------- Funções embutidas ----------

function binaryOp(stack, operation) {
  assertStackHas(stack, 2)
  const b = stack.pop()
  const a = stack.pop()
  stack.push(operation(a, b))
}

function add(stack) {
  binaryOp(stack, (a, b) => a + b)
}

function subtract(stack) {
  binaryOp(stack, (a, b) => a - b)
}

function multiply(stack) {
  binaryOp(stack, (a, b) => a * b)
}

function divide(stack) {
  assertStackHas(stack, 2)
  const b = stack.pop()
  const a = stack.pop()
  if (b === 0) throw new Error('Division by zero')
  stack.push(Math.floor(a / b))
}

function dup(stack) {
  assertStackHas(stack, 1)
  const a = stack.pop()
  stack.push(a, a)
}

function drop(stack) {
  assertStackHas(stack, 1)
  stack.pop()
}

function swap(stack) {
  assertStackHas(stack, 2)
  const b = stack.pop()
  const a = stack.pop()
  stack.push(b, a)
}

function over(stack) {
  assertStackHas(stack, 2)
  const b = stack.pop()
  const a = stack.pop()
  stack.push(a, b, a)
}