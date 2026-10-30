// Forth interpreter: skeleton of the 'Forth' exercise, refactored for readability.

const TOKEN_TYPES = Object.freeze({
  NUMBER: 'Number',
  NAME: 'Name',
  BEGIN_DEFINITION: 'BeginDefinition',
  END_DEFINITION: 'EndDefinition',
  EOF: 'EOF',
})

const TOKEN_PATTERNS = Object.freeze({
  whitespace: /\s+/y,
  number: /-?\d+/y,
  name: /[a-zA-Z][a-zA-Z0-9_-]*|\+|-|\*|\/]/y,
})

export class Forth {
  constructor() {
    this._stack = []
    this._symbols = [
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

  get stack() {
    return this._stack
  }

  // Interprets the program. Stack and symbol table keep their state across calls.
  evaluate(program) {
    if (program.length === 0) return

    let position = 0
    let token

    do {
      token = this.getToken(program, position)
      position = token.end

      switch (token.type) {
        case TOKEN_TYPES.NAME:
        case TOKEN_TYPES.NUMBER:
          evaluateToken(this._stack, this._symbols, token)
          break
        case TOKEN_TYPES.BEGIN_DEFINITION:
          position = this.parseDefinition(program, position)
          break
        case TOKEN_TYPES.END_DEFINITION:
          throw new Error('Unexpected end of definition')
      }
    } while (token.type !== TOKEN_TYPES.EOF && position <= program.length)
  }

  // Reads the next token from `text` starting at `start`, skipping whitespace.
  getToken(text, start) {
    let index = start

    while (index < text.length) {
      const skipped = matchAt(TOKEN_PATTERNS.whitespace, text, index)
      if (skipped) {
        index += skipped.length
        continue
      }

      const numberMatch = matchAt(TOKEN_PATTERNS.number, text, index)
      if (numberMatch) {
        return createToken(TOKEN_TYPES.NUMBER, Number(numberMatch), index, numberMatch.length)
      }

      if (text[index] === ':') {
        return createToken(TOKEN_TYPES.BEGIN_DEFINITION, ':', index, 1)
      }

      if (text[index] === ';') {
        return createToken(TOKEN_TYPES.END_DEFINITION, ';', index, 1)
      }

      const nameMatch = matchAt(TOKEN_PATTERNS.name, text, index)
      if (nameMatch) {
        return createToken(TOKEN_TYPES.NAME, nameMatch, index, nameMatch.length)
      }

      throw new Error(`Unrecognized token at ${index}`)
    }

    return createToken(TOKEN_TYPES.EOF, '', index, index)
  }

  // Parses a word definition (`: name ... ;`) and registers it in the symbol table.
  // Returns the index right after the closing `;`.
  parseDefinition(program, index) {
    let position = index

    const nameToken = this.getToken(program, position)
    if (nameToken.type !== TOKEN_TYPES.NAME) {
      throw new Error('Invalid definition')
    }
    position = nameToken.end

    const body = []
    let token
    do {
      token = this.getToken(program, position)
      if (token.type === TOKEN_TYPES.EOF) {
        throw new Error('Unexpected end of file')
      }
      position = token.end
      if (token.type !== TOKEN_TYPES.END_DEFINITION) {
        body.push(token)
      }
    } while (token.type !== TOKEN_TYPES.END_DEFINITION)

    // Only symbols defined before this word are visible to its body,
    // which prevents infinite recursion through self-reference.
    const lookback = this._symbols.length - 1

    this._symbols.push({
      name: nameToken.value.toLowerCase(),
      value: (stack) => evaluateTokens(stack, this._symbols, body, lookback),
    })

    return position
  }
}

// ---------------------------------------------------------------------------
// Tokenizer helpers
// ---------------------------------------------------------------------------

function createToken(type, value, start, length) {
  return { type, value, start, end: start + length }
}

// Returns the matched text at `index` for a sticky regex, or null.
function matchAt(pattern, text, index) {
  pattern.lastIndex = index
  const match = pattern.exec(text)
  return match ? match[0] : null
}

// ---------------------------------------------------------------------------
// Evaluation helpers
// ---------------------------------------------------------------------------

// Searches the symbol table backwards from `lookback` (or the end) for `name`.
// Returns the associated function, or null if not found.
function findName(symbols, name, lookback = null) {
  const target = name.toLowerCase()
  const start = lookback || symbols.length - 1

  for (let i = start; i >= 0; i--) {
    if (symbols[i].name === target) {
      return symbols[i].value
    }
  }
  return null
}

function evaluateToken(stack, symbols, token, lookback = null) {
  switch (token.type) {
    case TOKEN_TYPES.NUMBER:
      stack.push(token.value)
      break
    case TOKEN_TYPES.NAME: {
      const fn = findName(symbols, token.value, lookback)
      if (fn === null) {
        throw new Error('Unknown command')
      }
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

// ---------------------------------------------------------------------------
// Stack validation
// ---------------------------------------------------------------------------

// Throws if the stack does not have enough operands for the operation.
function checkStack(stack, requiredOperands = 2) {
  if (stack.length === 0) {
    throw new Error('Stack empty')
  }
  if (stack.length === 1 && requiredOperands === 2) {
    throw new Error('Only one value on the stack')
  }
}

// Pops the top two values, returning [a, b] where b was on top.
function popTwo(stack) {
  const b = stack.pop()
  const a = stack.pop()
  return [a, b]
}

// ---------------------------------------------------------------------------
// Built-in words
// ---------------------------------------------------------------------------

function add(stack) {
  checkStack(stack)
  const [a, b] = popTwo(stack)
  stack.push(a + b)
}

function subtract(stack) {
  checkStack(stack)
  const [a, b] = popTwo(stack)
  stack.push(a - b)
}

function multiply(stack) {
  checkStack(stack)
  const [a, b] = popTwo(stack)
  stack.push(a * b)
}

// Integer division (floored). Remove Math.floor for non-integer division.
function divide(stack) {
  checkStack(stack)
  const [a, b] = popTwo(stack)
  if (b === 0) {
    throw new Error('Division by zero')
  }
  stack.push(Math.floor(a / b))
}

function dup(stack) {
  checkStack(stack, 1)
  const a = stack.pop()
  stack.push(a, a)
}

function drop(stack) {
  checkStack(stack, 1)
  stack.pop()
}

function swap(stack) {
  checkStack(stack)
  const [a, b] = popTwo(stack)
  stack.push(b, a)
}

function over(stack) {
  checkStack(stack)
  const [a, b] = popTwo(stack)
  stack.push(a, b, a)
}