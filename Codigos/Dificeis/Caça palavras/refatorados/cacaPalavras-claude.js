/**
 * Direções de busca, na ordem em que são testadas.
 * Cada uma indica o deslocamento (linha, coluna) a cada letra da palavra.
 */
const DIRECTIONS = Object.freeze([
  { row: 0, col: 1 },    // esquerda → direita
  { row: 0, col: -1 },   // direita → esquerda
  { row: 1, col: 0 },    // cima → baixo
  { row: -1, col: 0 },   // baixo → cima
  { row: 1, col: 1 },    // diagonal superior-esquerda → inferior-direita
  { row: -1, col: -1 },  // diagonal inferior-direita → superior-esquerda
  { row: -1, col: 1 },   // diagonal inferior-esquerda → superior-direita
  { row: 1, col: -1 },   // diagonal superior-direita → inferior-esquerda
]);

/**
 * Representa um caça-palavras e permite localizar palavras nele.
 */
class WordSearch {
  /**
   * @param {string[]} puzzleGrid Linhas do caça-palavras.
   */
  constructor(puzzleGrid) {
    this.grid = puzzleGrid;
  }

  /**
   * Localiza cada palavra na grade.
   *
   * Para cada palavra, o resultado contém:
   *  - ausente, se a primeira letra da palavra não existe na grade;
   *  - undefined, se a primeira letra existe, mas a palavra não foi encontrada;
   *  - { start, end }, com as coordenadas (base 1) de início e fim, se encontrada.
   *
   * @param {string[]} wordsToBeSearched
   * @returns {Object<string, {start: number[], end: number[]} | undefined>}
   */
  find(wordsToBeSearched) {
    const findings = {};

    for (const word of wordsToBeSearched) {
      const candidates = this.#findCandidateStarts(word);
      if (candidates.length === 0) continue;

      findings[word] = undefined;

      for (const { row, col } of candidates) {
        const match = this.#matchInAnyDirection(row, col, word);
        if (match) {
          findings[word] = match;
          break;
        }
      }
    }

    return findings;
  }

  /**
   * Retorna todas as posições da grade cuja letra é a primeira da palavra.
   *
   * @param {string} word
   * @returns {{row: number, col: number}[]}
   */
  #findCandidateStarts(word) {
    const firstLetter = word[0];
    const starts = [];

    this.grid.forEach((line, row) => {
      for (let col = 0; col < line.length; col++) {
        if (line[col] === firstLetter) {
          starts.push({ row, col });
        }
      }
    });

    return starts;
  }

  /**
   * Tenta encontrar a palavra a partir da posição informada em todas as direções.
   *
   * @returns {{start: number[], end: number[]} | null}
   */
  #matchInAnyDirection(row, col, word) {
    for (const direction of DIRECTIONS) {
      const match = this.#matchInDirection(row, col, word, direction);
      if (match) return match;
    }
    return null;
  }

  /**
   * Verifica se a palavra começa em (row, col) e segue a direção informada.
   *
   * @returns {{start: number[], end: number[]} | null}
   */
  #matchInDirection(row, col, word, direction) {
    for (let i = 0; i < word.length; i++) {
      const cell = this.grid[row + direction.row * i]?.[col + direction.col * i];
      if (cell !== word[i]) return null;
    }

    const lastRow = row + direction.row * (word.length - 1);
    const lastCol = col + direction.col * (word.length - 1);

    return {
      start: [row + 1, col + 1],
      end: [lastRow + 1, lastCol + 1],
    };
  }
}

export default WordSearch;