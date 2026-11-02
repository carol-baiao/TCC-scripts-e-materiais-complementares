/**
 * Representa um caça-palavras e permite buscar palavras em oito direções.
 */
class WordSearch {
  /**
   * Direções de busca suportadas.
   * Cada direção é um par [deltaRow, deltaCol] aplicado a partir do início.
   */
  static #DIRECTIONS = [
    [0, 1],   // esquerda → direita
    [0, -1],  // direita → esquerda
    [1, 0],   // topo → base
    [-1, 0],  // base → topo
    [1, 1],   // diagonal ↘
    [-1, -1], // diagonal ↖
    [-1, 1],  // diagonal ↗
    [1, -1],  // diagonal ↙
  ];

  /**
   * @param {string[]} puzzleGrid Grade do caça-palavras (array de strings).
   */
  constructor(puzzleGrid) {
    if (!Array.isArray(puzzleGrid) || puzzleGrid.length === 0) {
      throw new TypeError('puzzleGrid deve ser um array não vazio de strings.');
    }
    this.grid = puzzleGrid;
  }

  /**
   * Busca cada palavra informada na grade.
   *
   * @param {string[]} wordsToSearch Palavras a serem procuradas.
   * @returns {Object.<string, {start: number[], end: number[]} | undefined>}
   *   Mapa palavra → coordenadas (1-based) ou `undefined` se não encontrada.
   */
  find(wordsToSearch) {
    if (!Array.isArray(wordsToSearch)) {
      throw new TypeError('wordsToSearch deve ser um array de strings.');
    }

    const results = {};

    for (const word of wordsToSearch) {
      results[word] = this.#searchWord(word);
    }

    return results;
  }

  /**
   * Procura uma palavra em todas as direções e posições de início.
   *
   * @param {string} word
   * @returns {{start: number[], end: number[]} | undefined}
   */
  #searchWord(word) {
    if (typeof word !== 'string' || word.length === 0) return undefined;

    const firstChar = word[0];

    for (let row = 0; row < this.grid.length; row++) {
      const startCols = this.#findStartColumns(row, firstChar);

      for (const col of startCols) {
        for (const [dRow, dCol] of WordSearch.#DIRECTIONS) {
          const match = this.#matchFrom({ row, col }, dRow, dCol, word);
          if (match) return match;
        }
      }
    }

    return undefined;
  }

  /**
   * Retorna todas as colunas da linha `row` onde o caractere `char` aparece.
   *
   * @param {number} row
   * @param {string} char
   * @returns {number[]}
   */
  #findStartColumns(row, char) {
    const columns = [];
    const line = this.grid[row];

    for (let col = 0; col < line.length; col++) {
      if (line[col] === char) columns.push(col);
    }

    return columns;
  }

  /**
   * Tenta casar `word` a partir de (row, col) seguindo (dRow, dCol).
   * Retorna coordenadas 1-based no formato { start, end } ou null.
   *
   * @param {{row: number, col: number}} origin
   * @param {number} dRow
   * @param {number} dCol
   * @param {string} word
   * @returns {{start: number[], end: number[]} | null}
   */
  #matchFrom({ row, col }, dRow, dCol, word) {
    const endRow = row + dRow * (word.length - 1);
    const endCol = col + dCol * (word.length - 1);

    if (!this.#isInside(endRow, endCol)) return null;

    for (let i = 0; i < word.length; i++) {
      const r = row + dRow * i;
      const c = col + dCol * i;
      if (this.grid[r][c] !== word[i]) return null;
    }

    return {
      start: [row + 1, col + 1],
      end: [endRow + 1, endCol + 1],
    };
  }

  /**
   * Verifica se (row, col) está dentro dos limites da grade.
   *
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  #isInside(row, col) {
    if (row < 0 || row >= this.grid.length) return false;
    const line = this.grid[row];
    return col >= 0 && col < line.length;
  }
}

export default WordSearch;