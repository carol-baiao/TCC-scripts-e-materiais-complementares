/**
 * Cálculo de pontuação do boliche (10 frames).
 *
 * Cada série guarda apenas a lista de jogadas (pinos derrubados por jogada).
 * As regras de frame, strike e spare são aplicadas sobre essa lista.
 */

const MAX_PINS = 10;
const FRAMES_PER_GAME = 10;

const ERRORS = {
  NEGATIVE_ROLL: 'Negative roll is invalid',
  TOO_MANY_PINS: 'Pin count exceeds pins on the lane',
  GAME_OVER: 'Cannot roll after game is over',
  GAME_NOT_FINISHED: 'Score cannot be taken until the end of the game',
  SERIES_NOT_FOUND: 'Series not found',
};

const isStrike = (rolls, index) => rolls[index] === MAX_PINS;

const isSpare = (rolls, index) =>
  !isStrike(rolls, index) && rolls[index] + rolls[index + 1] === MAX_PINS;

/**
 * Quantos pinos ficam em pé após uma jogada que derrubou `pinsDown`.
 * Quando todos os pinos caem, o conjunto é reposicionado (10 em pé).
 *
 * @param {number} pinsDown Pinos derrubados na última jogada.
 * @returns {number} Pinos em pé para a próxima jogada.
 */
function pinsStandingAfter(pinsDown) {
  return pinsDown === MAX_PINS ? MAX_PINS : MAX_PINS - pinsDown;
}

/**
 * Pinos em pé para a próxima jogada da 10ª frame.
 *
 * @param {number[]} rolls Jogadas feitas dentro da 10ª frame.
 * @returns {number|null} Pinos em pé, ou null se a 10ª frame já terminou.
 */
function getPinsStandingInLastFrame(rolls) {
  switch (rolls.length) {
    case 0:
      return MAX_PINS;

    case 1:
      return pinsStandingAfter(rolls[0]);

    case 2:
      if (isStrike(rolls, 0)) {
        return pinsStandingAfter(rolls[1]); // Bônus após strike.
      }
      return isSpare(rolls, 0) ? MAX_PINS : null; // Bônus após spare.

    default:
      return null;
  }
}

/**
 * Pinos em pé para a próxima jogada do jogo inteiro.
 *
 * @param {number[]} rolls Todas as jogadas da série.
 * @returns {number|null} Pinos em pé, ou null se o jogo terminou.
 */
function getPinsStandingForNextRoll(rolls) {
  let index = 0;

  for (let frame = 1; frame < FRAMES_PER_GAME; frame++) {
    if (index >= rolls.length) {
      return MAX_PINS; // Primeira jogada da frame ainda não feita.
    }

    if (isStrike(rolls, index)) {
      index += 1;
    } else {
      if (index + 1 >= rolls.length) {
        return pinsStandingAfter(rolls[index]); // Falta a segunda jogada.
      }
      index += 2;
    }
  }

  return getPinsStandingInLastFrame(rolls.slice(index));
}

/**
 * Calcula a pontuação total a partir da lista de jogadas.
 * Strike e spare recebem o bônus das próximas jogadas.
 *
 * @param {number[]} rolls Jogadas de uma série já finalizada.
 * @returns {number} Pontuação da série.
 */
function calculateScore(rolls) {
  let score = 0;
  let index = 0;

  for (let frame = 1; frame <= FRAMES_PER_GAME; frame++) {
    if (isStrike(rolls, index)) {
      score += MAX_PINS + rolls[index + 1] + rolls[index + 2];
      index += 1;
    } else if (isSpare(rolls, index)) {
      score += MAX_PINS + rolls[index + 2];
      index += 2;
    } else {
      score += rolls[index] + rolls[index + 1];
      index += 2;
    }
  }

  return score;
}

/**
 * Uma série (partida) de boliche.
 */
class Series {
  /**
   * @param {number} id Identificador da série.
   */
  constructor(id) {
    this.id = id;
    this.rolls = [];
  }

  /**
   * Registra uma jogada.
   *
   * @param {number} pins Pinos derrubados.
   */
  roll(pins) {
    if (pins < 0) {
      throw new Error(ERRORS.NEGATIVE_ROLL);
    }

    if (pins > MAX_PINS) {
      throw new Error(ERRORS.TOO_MANY_PINS);
    }

    const pinsStanding = getPinsStandingForNextRoll(this.rolls);

    if (pinsStanding === null) {
      throw new Error(ERRORS.GAME_OVER);
    }

    if (pins > pinsStanding) {
      throw new Error(ERRORS.TOO_MANY_PINS);
    }

    this.rolls.push(pins);
  }

  /**
   * @returns {boolean} true se o jogo terminou.
   */
  isFinished() {
    return getPinsStandingForNextRoll(this.rolls) === null;
  }

  /**
   * @returns {number} Pontuação da série.
   */
  score() {
    if (!this.isFinished()) {
      throw new Error(ERRORS.GAME_NOT_FINISHED);
    }

    return calculateScore(this.rolls);
  }
}

/**
 * Jogo de boliche composto por uma ou mais séries.
 */
export class Bowling {
  /**
   * @param {number} numberOfSeries Quantidade de séries no jogo.
   */
  constructor(numberOfSeries = 1) {
    this.series = Array.from(
      { length: numberOfSeries },
      (_, index) => new Series(index + 1)
    );
  }

  /**
   * Registra uma jogada em uma série.
   *
   * @param {number} pins Pinos derrubados.
   * @param {number} seriesId Identificador da série.
   */
  roll(pins, seriesId = 1) {
    this.findSeries(seriesId).roll(pins);
  }

  /**
   * @param {number} seriesId Identificador da série.
   * @returns {number} Pontuação da série.
   */
  score(seriesId = 1) {
    return this.findSeries(seriesId).score();
  }

  /**
   * @param {number} seriesId Identificador da série.
   * @returns {Series} A série encontrada.
   */
  findSeries(seriesId) {
    const series = this.series.find(s => s.id === seriesId);

    if (!series) {
      throw new Error(ERRORS.SERIES_NOT_FOUND);
    }

    return series;
  }
}