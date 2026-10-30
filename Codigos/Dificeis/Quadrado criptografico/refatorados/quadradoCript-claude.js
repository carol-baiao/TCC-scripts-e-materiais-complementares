/**
 * Cifra do quadrado (square code).
 *
 * O texto é normalizado (minúsculas, sem espaços nem pontuação),
 * distribuído em linhas de um retângulo quase quadrado e lido
 * coluna por coluna, com espaços separando blocos de linhas.
 */
export class Crypto {
  /**
   * @param {string} str Texto em claro a ser cifrado.
   */
  constructor(str) {
    this._plaintext = str;
    this._normalizedText = Crypto.normalize(str);
    [this._c, this._r] = Crypto.calculateDimensions(this._normalizedText.length);
    this._squareRows = Crypto.toRows(this._normalizedText, this._c);
    this._ciphertext = this._buildCiphertext();
  }

  /**
   * Texto cifrado.
   * @returns {string}
   */
  get ciphertext() {
    return this._ciphertext;
  }

  /**
   * Converte para minúsculas e remove espaços e pontuação.
   * @param {string} text
   * @returns {string}
   */
  static normalize(text) {
    return text.toLowerCase().trim().replace(/\W/g, '');
  }

  /**
   * Encontra as dimensões (colunas, linhas) do retângulo.
   * Escolhe o primeiro par, varrendo colunas a partir de 1,
   * tal que colunas * linhas >= tamanho, colunas >= linhas
   * e a diferença entre elas seja no máximo 1.
   * @param {number} length Tamanho do texto normalizado.
   * @returns {[number, number]} [colunas, linhas]
   */
  static calculateDimensions(length) {
    for (let cols = 1; cols <= length; cols++) {
      for (let rows = 1; rows <= length; rows++) {
        const fitsText = cols * rows >= length;
        const isWideOrSquare = cols >= rows;
        const isBalanced = cols - rows <= 1;

        if (fitsText && isWideOrSquare && isBalanced) {
          return [cols, rows];
        }
      }
    }
    return [0, 0];
  }

  /**
   * Divide o texto em linhas de `width` caracteres,
   * completando a última com espaços.
   * @param {string} text
   * @param {number} width
   * @returns {string[]}
   */
  static toRows(text, width) {
    const rows = [];
    for (let start = 0; start < text.length; start += width) {
      rows.push(text.slice(start, start + width).padEnd(width, ' '));
    }
    return rows;
  }

  /**
   * Lê a grade coluna por coluna. Ao final de cada bloco de
   * linhas (exceto no último bloco de colunas), insere um espaço.
   * @returns {string}
   */
  _buildCiphertext() {
    const chunks = [];
    for (let col = 0; col < this._c; col++) {
      let column = '';
      for (let row = 0; row < this._r; row++) {
        column += this._squareRows[row][col];
      }
      chunks.push(column);
    }
    return chunks.join(' ');
  }
}