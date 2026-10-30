export class Forth {
  constructor() {
    this._stack = [];
    
    // Tabela de símbolos nativos (instruções em caixa baixa para buscas insensíveis a maiúsculas)
    this._customSymbols = new Map();
    this._builtIns = {
      '+': (stack) => this._binaryOp(stack, (a, b) => a + b),
      '-': (stack) => this._binaryOp(stack, (a, b) => a - b),
      '*': (stack) => this._binaryOp(stack, (a, b) => a * b),
      '/': (stack) => this._binaryOp(stack, (a, b) => {
        if (b === 0) throw new Error('Division by zero');
        return Math.floor(a / b);
      }),
      'dup': (stack) => {
        this._ensureStackSize(stack, 1);
        stack.push(stack[stack.length - 1]);
      },
      'drop': (stack) => {
        this._ensureStackSize(stack, 1);
        stack.pop();
      },
      'swap': (stack) => {
        this._ensureStackSize(stack, 2);
        const b = stack.pop();
        const a = stack.pop();
        stack.push(b, a);
      },
      'over': (stack) => {
        this._ensureStackSize(stack, 2);
        stack.push(stack[stack.length - 2]);
      },
    };
  }

  get stack() {
    return this._stack;
  }

  /**
   * Avalia a string do programa em Forth.
   */
  evaluate(programText) {
    if (!programText.trim()) return;

    let index = 0;
    while (index < programText.length) {
      const token = this._getNextToken(programText, index);

      switch (token.type) {
        case 'Number':
        case 'Name':
          index = token.end;
          this._executeToken(token);
          break;

        case 'BeginDefinition':
          index = this._parseDefinition(programText, token.end);
          break;

        case 'EndDefinition':
          throw new Error('Unexpected end of definition');

        case 'EOF':
          index = programText.length;
          break;

      }
    }
  }

  // --- Parser & Lexer ---

  _getNextToken(text, start) {
    const reWhitespace = /^\s+/;
    const reNumber = /^-?\d+/;
    const reName = /^([a-zA-Z][a-zA-Z0-9_-]*|\+|-|\*|\/)/;

    let i = start;

    while (i < text.length) {
      const currentText = text.substring(i);

      // Descartar espaços em branco
      const wsMatch = reWhitespace.exec(currentText);
      if (wsMatch) {
        i += wsMatch[0].length;
        continue;
      }

      // Identificar Números
      const numMatch = reNumber.exec(currentText);
      if (numMatch) {
        return {
          type: 'Number',
          value: Number(numMatch[0]),
          end: i + numMatch[0].length,
        };
      }

      // Delimitadores de definição
      if (text[i] === ':') {
        return { type: 'BeginDefinition', value: ':', end: i + 1 };
      }
      if (text[i] === ';') {
        return { type: 'EndDefinition', value: ';', end: i + 1 };
      }

      // Identificar Nomes/Palavras
      const nameMatch = reName.exec(currentText);
      if (nameMatch) {
        return {
          type: 'Name',
          value: nameMatch[0],
          end: i + nameMatch[0].length,
        };
      }

      throw new Error(`Unrecognized token at ${i}`);
    }

    return { type: 'EOF', value: '', end: i };
  }

  _parseDefinition(programText, startIndex) {
    let index = startIndex;

    // A palavra a ser definida precisa ser do tipo 'Name'
    const nameToken = this._getNextToken(programText, index);
    if (nameToken.type !== 'Name') {
      throw new Error('Invalid definition');
    }

    // Nomes de funções personalizadas não podem ser numéricos
    if (!isNaN(Number(nameToken.value))) {
      throw new Error('Invalid definition');
    }

    const wordName = nameToken.value.toLowerCase();
    index = nameToken.end;

    const definitionTokens = [];
    let token = this._getNextToken(programText, index);

    while (token.type !== 'EndDefinition') {
      if (token.type === 'EOF') {
        throw new Error('Unexpected end of file');
      }
      definitionTokens.push(token);
      index = token.end;
      token = this._getNextToken(programText, index);
    }

    // Congela a definição expandindo tokens atuais (evita loops infinitos ou redefinições recursivas)
    const expandedFn = this._compileTokens(definitionTokens);
    this._customSymbols.set(wordName, expandedFn);

    return token.end;
  }

  _compileTokens(tokens) {
    // Avalia e expande os tokens da definição no momento da criação
    return (stack) => {
      for (const token of tokens) {
        this._executeToken(token, stack);
      }
    };
  }

  _executeToken(token, targetStack = this._stack) {
    if (token.type === 'Number') {
      targetStack.push(token.value);
      return;
    }

    if (token.type === 'Name') {
      const command = token.value.toLowerCase();

      // Busca primeiro em símbolos personalizados, depois nas funções embutidas
      const customFn = this._customSymbols.get(command);
      if (customFn) {
        customFn(targetStack);
        return;
      }

      const builtInFn = this._builtIns[command];
      if (builtInFn) {
        builtInFn(targetStack);
        return;
      }

      throw new Error('Unknown command');
    }
  }

  // --- Operações de Pilha Auxiliares ---

  _ensureStackSize(stack, requiredSize) {
    if (stack.length === 0) {
      throw new Error('Stack empty');
    }
    if (stack.length < requiredSize) {
      throw new Error('Only one value on the stack');
    }
  }

  _binaryOp(stack, operation) {
    this._ensureStackSize(stack, 2);
    const b = stack.pop();
    const a = stack.pop();
    stack.push(operation(a, b));
  }
}