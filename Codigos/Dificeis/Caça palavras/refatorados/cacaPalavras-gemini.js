/**
 * As 8 direções possíveis no caça-palavras (rowDelta, colDelta).
 */
const DIRECTIONS = [
  { rowDelta: 0, colDelta: 1 },   // Esquerda para Direita
  { rowDelta: 0, colDelta: -1 },  // Direita para Esquerda
  { rowDelta: 1, colDelta: 0 },   // Cima para Baixo
  { rowDelta: -1, colDelta: 0 },  // Baixo para Cima
  { rowDelta: 1, colDelta: 1 },   // Diagonal Superior Esquerda -> Inferior Direita
  { rowDelta: -1, colDelta: -1 }, // Diagonal Inferior Direita -> Superior Esquerda
  { rowDelta: -1, colDelta: 1 },  // Diagonal Inferior Esquerda -> Superior Direita
  { rowDelta: 1, colDelta: -1 }   // Diagonal Superior Direita -> Inferior Esquerda
];

class WordSearch {
  /**
   * @param {string[]} puzzleGrid - Onde cada elemento representa uma linha da grade.
   */
  constructor(puzzleGrid) {
    this.grid = puzzleGrid;
    this.rowCount = puzzleGrid.length;
    this.colCount = puzzleGrid[0] ? puzzleGrid[0].length : 0;
  }

  /**
   * Busca um conjunto de palavras na grade do caça-palavras.
   * 
   * @param {string[]} wordsToBeSearched - Lista de palavras a procurar.
   * @returns {Object} Mapeamento da palavra para suas coordenadas ou undefined.
   */
  find(wordsToBeSearched) {
    const findingsObj = {};

    for (const word of wordsToBeSearched) {
      findingsObj[word] = this.#findWord(word);
    }

    return findingsObj;
  }

  /**
   * Procura uma única palavra em toda a grade.
   */
  #findWord(word) {
    if (!word) return undefined;

    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.colCount; c++) {
        if (this.grid[r][c] === word[0]) {
          const match = this.#searchFromCell(r, c, word);
          if (match) return match;
        }
      }
    }

    return undefined;
  }

  /**
   * Tenta encontrar a palavra em todas as 8 direções a partir de uma coordenada (row, col).
   */
  #searchFromCell(startRow, startCol, word) {
    for (const { rowDelta, colDelta } of DIRECTIONS) {
      const match = this.#checkDirection(startRow, startCol, rowDelta, colDelta, word);
      if (match) return match;
    }
    return null;
  }

  /**
   * Verifica se a palavra existe seguindo uma direção específica.
   */
  #checkDirection(startRow, startCol, rowDelta, colDelta, word) {
    const endRow = startRow + rowDelta * (word.length - 1);
    const endCol = startCol + colDelta * (word.length - 1);

    // Verifica limites do grid
    if (endRow < 0 || endRow >= this.rowCount || endCol < 0 || endCol >= this.colCount) {
      return null;
    }

    for (let i = 0; i < word.length; i++) {
      const currentRow = startRow + rowDelta * i;
      const currentCol = startCol + colDelta * i;

      if (this.grid[currentRow][currentCol] !== word[i]) {
        return null;
      }
    }

    // Retorna no formato base-1 conforme o código original
    return {
      start: [startRow + 1, startCol + 1],
      end: [endRow + 1, endCol + 1]
    };
  }
}

export default WordSearch;