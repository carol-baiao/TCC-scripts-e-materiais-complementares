/**
 * Representa a cifra do "Square Code" (Código Quadrado).
 */
export class Crypto {
  #plaintext;

  /**
   * @param {string} text - Texto plano a ser codificado.
   */
  constructor(text) {
    this.#plaintext = text || '';
  }

  /**
   * Retorna o texto codificado no formato Square Code.
   * @returns {string}
   */
  get ciphertext() {
    const normalizedText = this.#normalize(this.#plaintext);
    if (!normalizedText) return '';

    const { cols, rows } = this.#calculateDimensions(normalizedText.length);
    const squareGrid = this.#buildSquareGrid(normalizedText, cols);

    return this.#encodeGrid(squareGrid, cols, rows);
  }

  /**
   * Normaliza o texto removendo caracteres não alfanuméricos e convertendo para minúsculas.
   */
  #normalize(text) {
    return text.toLowerCase().replace(/[\W_]/g, '');
  }

  /**
   * Calcula as dimensões de colunas (c) e linhas (r) da grade retangular.
   * Regras: c >= r e c - r <= 1.
   */
  #calculateDimensions(length) {
    const cols = Math.ceil(Math.sqrt(length));
    const rows = Math.ceil(length / cols);
    return { cols, rows };
  }

  /**
   * Divide o texto em linhas de tamanho fixo `cols`, preenchendo a última com espaços se necessário.
   */
  #buildSquareGrid(text, cols) {
    const rows = [];
    for (let i = 0; i < text.length; i += cols) {
      const chunk = text.slice(i, i + cols);
      rows.push(chunk.padEnd(cols, ' '));
    }
    return rows;
  }

  /**
   * Transpõe a grade de caracteres para compor a mensagem cifrada final.
   */
  #encodeGrid(grid, cols, rows) {
    const chunks = [];

    for (let col = 0; col < cols; col++) {
      let chunk = '';
      for (let row = 0; row < rows; row++) {
        chunk += grid[row][col];
      }
      chunks.push(chunk);
    }

    return chunks.join(' ');
  }
}