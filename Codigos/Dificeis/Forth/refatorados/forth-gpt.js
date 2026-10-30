// Interpretador de uma linguagem baseada em pilha (Forth).
export class Forth {
  constructor() {
    this._stack = [];
    this._symbols = [
      { name: '+', value: add },
      { name: '-', value: subtract },
      { name: '*', value: multiply },
      { name: '/', value: divide },
      { name: 'dup', value: dup },
      { name: 'drop', value: drop },
      { name: 'swap', value: swap },
      { name: 'over', value: over },
    ];
  }

  // A pilha e a tabela de símbolos mantêm o estado entre chamadas.
  evaluate(program) {
    if (program.length === 0) {
      return;
    }

    let index = 0;
    let done = false;

    while (!done) {
      const token = this.getToken(program, index);

      switch (token.type) {
        case 'Name':
        case 'Number':
          index = token.end;
          evaluateToken(this._stack, this._symbols, token);
          break;

        case 'BeginDefinition':
          index = token.end;
          index = this.parseDefinition(program, index);
          break;

        case 'EndDefinition':
          throw new Error('Unexpected end of definition');

        case 'EOF':
          done = true;
          break;
      }

      if (index > program.length) {
        done = true;
      }
    }
  }

  get stack() {
    return this._stack;
  }

  getToken(text, start) {
    const whitespacePattern = /^\s+/;
    const numberPattern = /^-?\d+/;
    const namePattern = /^([a-zA-Z][a-zA-Z0-9_-]*|\+|-|\*|\/)/;
    let index = start;

    while (index < text.length) {
      const remainingText = text.substring(index);
      let match = whitespacePattern.exec(remainingText);

      if (match !== null) {
        index += match[0].length;
        continue;
      }

      match = numberPattern.exec(remainingText);

      if (match !== null) {
        const value = Number(match[0]);
        const endIndex = index + match[0].length;

        return {
          type: 'Number',
          value,
          start: index,
          end: endIndex,
        };
      }

      if (text[index] === ':') {
        return {
          type: 'BeginDefinition',
          value: ':',
          start: index,
          end: index + 1,
        };
      }

      if (text[index] === ';') {
        return {
          type: 'EndDefinition',
          value: ';',
          start: index,
          end: index + 1,
        };
      }

      match = namePattern.exec(remainingText);

      if (match !== null) {
        const endIndex = index + match[0].length;

        return {
          type: 'Name',
          value: match[0],
          start: index,
          end: endIndex,
        };
      }

      throw new Error(`Unrecognized token at ${index}`);
    }

    return {
      type: 'EOF',
      value: '',
      start: index,
      end: index,
    };
  }

  parseDefinition(program, startIndex) {
    const tokens = [];
    let index = startIndex;

    // A definição deve começar com um nome.
    let token = this.getToken(program, index);

    if (token.type !== 'Name') {
      throw new Error('Invalid definition');
    }

    const name = token.value;
    index = token.end;

    while (token.type !== 'EndDefinition') {
      token = this.getToken(program, index);

      if (token.type === 'EOF') {
        throw new Error('Unexpected end of file');
      }

      index = token.end;

      if (token.type !== 'EndDefinition') {
        tokens.push(token);
      }
    }

    // A palavra só pode acessar símbolos existentes no momento da definição.
    // Isso evita que definições posteriores alterem sua resolução de nomes.
    const lookback = this._symbols.length - 1;

    this._symbols.push({
      name: name.toLowerCase(),
      value: (stack) =>
        evaluateTokens(stack, this._symbols, tokens, lookback),
    });

    return index;
  }
}

// Verifica se há operandos suficientes para a operação.
function checkStack(stack, requiredOperands = 2) {
  if (stack.length === 0) {
    throw new Error('Stack empty');
  }

  if (stack.length === 1 && requiredOperands === 2) {
    throw new Error('Only one value on the stack');
  }

  return true;
}

// Procura um nome na tabela de símbolos, do fim para o início.
function findName(symbols, name, lookback = null) {
  const target = name.toLowerCase();
  const startIndex = lookback || symbols.length - 1;

  for (let index = startIndex; index >= 0; index--) {
    if (target === symbols[index].name) {
      return symbols[index].value;
    }
  }

  return null;
}

// Avalia um token de número ou de nome.
function evaluateToken(stack, symbols, token, lookback = null) {
  switch (token.type) {
    case 'Number':
      stack.push(token.value);
      break;

    case 'Name': {
      const command = findName(symbols, token.value, lookback);

      if (command === null) {
        throw new Error('Unknown command');
      }

      command(stack);
      break;
    }
  }
}

// Avalia uma sequência de tokens.
function evaluateTokens(stack, symbols, tokens, lookback = null) {
  for (const token of tokens) {
    evaluateToken(stack, symbols, token, lookback);
  }
}

// Operações nativas da linguagem.
function add(stack) {
  checkStack(stack);

  const secondOperand = stack.pop();
  const firstOperand = stack.pop();

  stack.push(firstOperand + secondOperand);
}

function subtract(stack) {
  checkStack(stack);

  const secondOperand = stack.pop();
  const firstOperand = stack.pop();

  stack.push(firstOperand - secondOperand);
}

function multiply(stack) {
  checkStack(stack);

  const secondOperand = stack.pop();
  const firstOperand = stack.pop();

  stack.push(firstOperand * secondOperand);
}

function divide(stack) {
  checkStack(stack);

  const secondOperand = stack.pop();
  const firstOperand = stack.pop();

  if (secondOperand === 0) {
    throw new Error('Division by zero');
  }

  stack.push(Math.floor(firstOperand / secondOperand));
}

function dup(stack) {
  checkStack(stack, 1);

  const value = stack.pop();

  stack.push(value);
  stack.push(value);
}

function drop(stack) {
  checkStack(stack, 1);
  stack.pop();
}

function swap(stack) {
  checkStack(stack);

  const secondOperand = stack.pop();
  const firstOperand = stack.pop();

  stack.push(secondOperand);
  stack.push(firstOperand);
}

function over(stack) {
  checkStack(stack);

  const secondOperand = stack.pop();
  const firstOperand = stack.pop();

  stack.push(firstOperand);
  stack.push(secondOperand);
  stack.push(firstOperand);
}