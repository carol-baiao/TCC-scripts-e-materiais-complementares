/**
 * Representa um Frame (jogada) de boliche.
 */
class Frame {
  /**
   * @param {number} id - Identificador do frame (1 a 10).
   */
  constructor(id) {
    this.id = id;
    this.rolls = [];
  }

  get isTenth() {
    return this.id === 10;
  }

  get isStrike() {
    return this.rolls[0] === 10;
  }

  get isSpare() {
    return !this.isStrike && this.pinsSum(0, 2) === 10;
  }

  get isComplete() {
    if (this.isTenth) {
      if (this.rolls.length < 2) return false;
      const requiresThirdRoll = this.rolls[0] === 10 || this.pinsSum(0, 2) === 10;
      return requiresThirdRoll ? this.rolls.length === 3 : this.rolls.length === 2;
    }
    return this.isStrike || this.rolls.length === 2;
  }

  /**
   * Soma os pinos derrubados em um determinado intervalo de arremessos do frame.
   */
  pinsSum(start = 0, count = this.rolls.length) {
    return this.rolls.slice(start, start + count).reduce((sum, pins) => sum + pins, 0);
  }

  /**
   * Adiciona o resultado de um arremesso validando limites de pinos do frame.
   * @param {number} pins 
   */
  addRoll(pins) {
    if (this.isComplete) {
      throw new Error('Frame já concluído');
    }

    if (this.isTenth) {
      this.validateTenthFrameRoll(pins);
    } else {
      if (this.rolls.length === 1 && this.rolls[0] + pins > 10) {
        throw new Error('Pin count exceeds pins on the lane');
      }
    }

    this.rolls.push(pins);
  }

  validateTenthFrameRoll(pins) {
    const [first, second] = this.rolls;

    if (this.rolls.length === 1 && first !== 10 && first + pins > 10) {
      throw new Error('Pin count exceeds pins on the lane');
    }

    if (this.rolls.length === 2 && first === 10 && second !== 10 && second + pins > 10) {
      throw new Error('Pin count exceeds pins on the lane');
    }
  }

  /**
   * Mapeamento apenas visual do resultado dos arremessos (ex: 'X', '/', '5').
   */
  getRollDisplay(index) {
    const pin = this.rolls[index];
    if (pin === undefined) return null;

    if (this.isTenth) {
      if (pin === 10) return 'X';
      if (index === 1 && this.rolls[0] !== 10 && this.rolls[0] + pin === 10) return '/';
      if (index === 2 && this.rolls[1] !== 10 && this.rolls[1] + pin === 10) return '/';
      return pin;
    }

    if (index === 0 && pin === 10) return 'X';
    if (index === 1 && this.rolls[0] + pin === 10) return '/';
    return pin;
  }

  get firstRoll() { return this.getRollDisplay(0); }
  get secondRoll() { return this.getRollDisplay(1); }
  get thirdRoll() { return this.isTenth ? this.getRollDisplay(2) : null; }
}

/**
 * Gerencia uma série/partida contendo os 10 frames.
 */
class BowlingSeries {
  /**
   * @param {number} id 
   */
  constructor(id) {
    this.id = id;
    this.frames = Array.from({ length: 10 }, (_, index) => new Frame(index + 1));
  }

  /**
   * Retorna o frame atual que ainda precisa receber arremessos.
   * @returns {Frame|undefined}
   */
  getCurrentFrame() {
    return this.frames.find(frame => !frame.isComplete);
  }

  /**
   * Registra a derrubada de pinos no frame ativo.
   * @param {number} pins 
   */
  setRoll(pins) {
    if (pins < 0) {
      throw new Error('Negative roll is invalid');
    }
    if (pins > 10) {
      throw new Error('Pin count exceeds pins on the lane');
    }

    const frame = this.getCurrentFrame();
    if (!frame) {
      throw new Error('Cannot roll after game is over');
    }

    frame.addRoll(pins);
  }

  /**
   * Calcula e retorna a pontuação acumulada total da partida.
   * @returns {number}
   */
  getSeriesScore() {
    if (!this.frames.every(f => f.isComplete)) {
      throw new Error('Score cannot be taken until the end of the game');
    }

    // Cria uma lista sequencial plana de todos os pinos jogados na partida
    const allRolls = this.frames.flatMap(frame => frame.rolls);
    let totalScore = 0;
    let rollIndex = 0;

    for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
      if (allRolls[rollIndex] === 10) { // Strike
        totalScore += 10 + (allRolls[rollIndex + 1] || 0) + (allRolls[rollIndex + 2] || 0);
        rollIndex += 1;
      } else if (allRolls[rollIndex] + allRolls[rollIndex + 1] === 10) { // Spare
        totalScore += 10 + (allRolls[rollIndex + 2] || 0);
        rollIndex += 2;
      } else { // Jogada aberta
        totalScore += allRolls[rollIndex] + (allRolls[rollIndex + 1] || 0);
        rollIndex += 2;
      }
    }

    return totalScore;
  }
}

/**
 * Classe principal para interface externa do jogo de Boliche.
 */
export class Bowling {
  /**
   * @param {number} numberOfSeries 
   */
  constructor(numberOfSeries = 1) {
    this.series = Array.from({ length: numberOfSeries }, (_, index) => new BowlingSeries(index + 1));
  }

  /**
   * Realiza um arremesso na série especificada.
   * @param {number} pins 
   * @param {number} seriesId 
   */
  roll(pins, seriesId = 1) {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) {
      throw new Error(`Series with id ${seriesId} not found`);
    }
    series.setRoll(pins);
  }

  /**
   * Obtém a pontuação final da série solicitada.
   * @param {number} seriesId 
   * @returns {number}
   */
  score(seriesId = 1) {
    const series = this.series.find(s => s.id === seriesId);
    if (!series) {
      throw new Error(`Series with id ${seriesId} not found`);
    }
    return series.getSeriesScore();
  }
}