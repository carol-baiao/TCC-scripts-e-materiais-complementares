/**
 * Codifica mensagens usando o método clássico "square code"
 * (também conhecido como cifra de grade / columnar transposition).
 */
export class Crypto {
  /**
   * @param {string} plaintext - Texto original a ser cifrado.
   */
  constructor(plaintext) {
    this._plaintext = plaintext;
    this._normalizedText = this._normalize(plaintext);
    this._columnCount = this._computeColumnCount(this._normalizedText.length);
    this._rowCount = this._computeRowCount(this._normalizedText.length, this._columnCount);
    this._ciphertext = this._encrypt();
  }

  /** Texto cifrado. */
  get ciphertext() {
    return this._ciphertext;
  }

  /**
   * Remove espaços e pontuação e converte para minúsculas.
   * @param {string} text
   * @returns {string}
   */
  _normalize(text) {
    return text.toLowerCase().replace(/[^\w]/g, '');
  }

  /**
   * Calcula o número de colunas: menor inteiro c tal que
   * c * (c - 1) >= length, ou seja, c = ceil(sqrt(length)).
   * @param {number} length
   * @returns {number}
   */
  _computeColumnCount(length) {
    if (length === 0) return 0;
    return Math.ceil(Math.sqrt(length));
  }

  /**
   * Calcula o número de linhas necessário para caber o texto
   * dada a quantidade de colunas.
   * @param {number} length
   * @param {number} columns
   * @returns {number}
   */
  _computeRowCount(length, columns) {
    if (length === 0) return 0;
    return Math.ceil(length / columns);
  }

  /**
   * Gera o texto cifrado lendo o grid coluna por coluna.
   * @returns {string}
   */
  _encrypt() {
    const { _normalizedText: text, _columnCount: cols, _rowCount: rows } = this;
    if (text.length === 0) return '';

    const chunks = [];

    for (let col = 0; col < cols; col++) {
      let chunk = '';
      for (let row = 0; row < rows; row++) {
        const index = row * cols + col;
        if (index < text.length) {
          chunk += text[index];
        }
      }
      if (chunk) chunks.push(chunk);
    }

    return chunks.join(' ');
  }
}