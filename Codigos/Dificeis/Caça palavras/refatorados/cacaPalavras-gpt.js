/**
 * Representa um mecanismo de busca de palavras em uma grade.
 */
class WordSearch {
  static DIRECTIONS = [
    { row: 0, col: 1 },   // Esquerda para direita
    { row: 0, col: -1 },  // Direita para esquerda
    { row: 1, col: 0 },   // Cima para baixo
    { row: -1, col: 0 },  // Baixo para cima
    { row: 1, col: 1 },   // Diagonal superior esquerda para inferior direita
    { row: -1, col: -1 }, // Diagonal inferior direita para superior esquerda
    { row: -1, col: 1 },  // Diagonal inferior esquerda para superior direita
    { row: 1, col: -1 },  // Diagonal superior direita para inferior esquerda
  ];

  /**
   * Inicializa a busca com a grade de letras.
   *
   * @param {string[]} puzzleGrid - Grade contendo as letras.
   */
  constructor(puzzleGrid) {
    this.grid = puzzleGrid;
  }

  /**
   * Procura as palavras informadas na grade.
   *
   * @param {string[]} wordsToBeSearched - Palavras a serem encontradas.
   * @returns {Object} Objeto com as coordenadas das palavras encontradas.
   */
  find(wordsToBeSearched) {
    const findings = {};

    for (const word of wordsToBeSearched) {
      const match = this.#findWord(word);

      findings[word] = match ?? undefined;
    }

    return findings;
  }

  /**
   * Procura uma palavra em todas as posições e direções possíveis.
   *
   * @param {string} word - Palavra que será procurada.
   * @returns {Object|null} Coordenadas inicial e final, ou null.
   */
  #findWord(word) {
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        if (this.grid[row][col] !== word[0]) {
          continue;
        }

        for (const direction of WordSearch.DIRECTIONS) {
          const match = this.#matchDirection({
            row,
            col,
            word,
            direction,
          });

          if (match) {
            return match;
          }
        }
      }
    }

    return null;
  }

  /**
   * Verifica se uma palavra corresponde a uma direção específica.
   *
   * @param {Object} position - Posição inicial da busca.
   * @param {number} position.row - Índice da linha inicial.
   * @param {number} position.col - Índice da coluna inicial.
   * @param {string} position.word - Palavra procurada.
   * @param {Object} position.direction - Deslocamento da direção.
   * @returns {Object|null} Coordenadas da palavra, se encontrada.
   */
  #matchDirection({ row, col, word, direction }) {
    const startRow = row;
    const startCol = col;

    for (let index = 0; index < word.length; index++) {
      const currentRow = startRow + index * direction.row;
      const currentCol = startCol + index * direction.col;

      // Verifica se a posição está dentro dos limites da grade.
      if (
        currentRow < 0 ||
        currentRow >= this.grid.length ||
        currentCol < 0 ||
        currentCol >= this.grid[currentRow].length
      ) {
        return null;
      }

      // Interrompe a busca quando uma letra não corresponde.
      if (this.grid[currentRow][currentCol] !== word[index]) {
        return null;
      }
    }

    // Retorna as coordenadas utilizando índices iniciados em 1.
    return {
      start: [startRow + 1, startCol + 1],
      end: [
        startRow + (word.length - 1) * direction.row + 1,
        startCol + (word.length - 1) * direction.col + 1,
      ],
    };
  }
}

export default WordSearch;