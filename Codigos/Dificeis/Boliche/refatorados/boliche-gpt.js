/**
 * Representa um frame do jogo de boliche.
 */
class Frame {
  /**
   * @param {number} id Identificador do frame (1-10).
   */
  constructor(id) {
    this.id = id;
    this.firstRoll = null;
    this.secondRoll = null;
    this.score = null;
  }
}

/**
 * Representa o décimo frame, que permite uma terceira jogada.
 */
class LastFrame extends Frame {
  constructor() {
    super(10);
    this.thirdRoll = null;
  }
}

/**
 * Gerencia os frames e a pontuação de uma série de boliche.
 */
class BowlingSeries {
  constructor(id) {
    this.id = id;
    this.frames = [];
    this.initFrames();
  }

  /**
   * Inicializa os dez frames da série.
   */
  initFrames() {
    this.frames = Array.from(
      { length: 9 },
      (_, index) => new Frame(index + 1)
    );

    this.frames.push(new LastFrame());
  }

  /**
   * Retorna o próximo frame que pode receber uma jogada.
   * @returns {Frame|undefined}
   */
  getNextFrame() {
    return this.frames.find((frame) => {
      const isLastFrame = frame.id === 10;

      if (
        isLastFrame &&
        frame.firstRoll !== null &&
        frame.secondRoll !== null &&
        frame.thirdRoll === null &&
        frame.score === null
      ) {
        return true;
      }

      if (
        isLastFrame &&
        frame.firstRoll !== null &&
        frame.secondRoll === null &&
        frame.thirdRoll === null
      ) {
        return true;
      }

      if (frame.firstRoll <= 9 && frame.secondRoll === null) {
        return true;
      }

      return frame.firstRoll === null;
    });
  }

  /**
   * Registra o resultado de uma jogada.
   * @param {number} pins Quantidade de pinos derrubados.
   */
  setRoll(pins) {
    if (pins < 0) {
      throw new Error('Negative roll is invalid');
    }

    if (pins > 10) {
      throw new Error('Pin count exceeds pins on the lane');
    }

    const nextFrame = this.getNextFrame();

    if (!nextFrame) {
      throw new Error('Cannot roll after game is over');
    }

    if (nextFrame.firstRoll === null) {
      nextFrame.firstRoll = pins === 10 ? 'X' : pins;
    } else if (nextFrame.secondRoll === null) {
      if (pins === 10) {
        nextFrame.secondRoll = 'X';
      } else if (nextFrame.firstRoll + pins === 10) {
        nextFrame.secondRoll = '/';
      } else {
        if (nextFrame.firstRoll + pins > 10) {
          throw new Error('Pin count exceeds pins on the lane');
        }

        nextFrame.secondRoll = pins;
      }
    } else if (nextFrame.thirdRoll === null) {
      if (pins === 10) {
        if (!isNaN(nextFrame.secondRoll)) {
          throw new Error('Pin count exceeds pins on the lane');
        }

        nextFrame.thirdRoll = 'X';
      } else if (nextFrame.secondRoll + pins === 10) {
        nextFrame.thirdRoll = '/';
      } else {
        if (nextFrame.secondRoll + pins > 10) {
          throw new Error('Pin count exceeds pins on the lane');
        }

        nextFrame.thirdRoll = pins;
      }
    }

    this.calculateFrameScore(nextFrame.id);
  }

  /**
   * Calcula a pontuação do frame informado e atualiza
   * as pontuações anteriores quando necessário.
   * @param {number} frameId Identificador do frame.
   */
  calculateFrameScore(frameId) {
    const currentFrame = this.frames.find(
      (frame) => frame.id === frameId
    );

    const previousFrame = this.frames.find(
      (frame) => frame.id === frameId - 1
    );

    const previousPreviousFrame = this.frames.find(
      (frame) => frame.id === frameId - 2
    );

    if (currentFrame.id < 10) {
      this.calculateRegularFrameScore(
        currentFrame,
        previousFrame,
        previousPreviousFrame
      );
    } else {
      this.calculateLastFrameScore(
        currentFrame,
        previousFrame,
        previousPreviousFrame
      );
    }
  }

  /**
   * Calcula a pontuação dos frames de 1 a 9.
   */
  calculateRegularFrameScore(
    currentFrame,
    previousFrame,
    previousPreviousFrame
  ) {
    if (
      currentFrame.firstRoll !== 'X' &&
      currentFrame.secondRoll !== '/'
    ) {
      currentFrame.score =
        currentFrame.firstRoll + currentFrame.secondRoll;

      if (previousFrame && previousFrame.secondRoll === '/') {
        previousFrame.score = 10 + currentFrame.firstRoll;
      } else if (previousFrame && previousFrame.firstRoll === 'X') {
        previousFrame.score = 10 + currentFrame.score;

        if (
          previousPreviousFrame &&
          previousPreviousFrame.firstRoll === 'X'
        ) {
          previousPreviousFrame.score = 20 + currentFrame.firstRoll;
        }
      }
    } else if (currentFrame.secondRoll === '/') {
      if (previousFrame && previousFrame.secondRoll === '/') {
        previousFrame.score = 10 + currentFrame.firstRoll;
      } else if (previousFrame && previousFrame.firstRoll === 'X') {
        previousFrame.score = 20;

        if (
          previousPreviousFrame &&
          previousPreviousFrame.firstRoll === 'X'
        ) {
          previousPreviousFrame.score = 20 + currentFrame.firstRoll;
        }
      }
    } else if (currentFrame.firstRoll === 'X') {
      if (previousFrame && previousFrame.secondRoll === '/') {
        previousFrame.score = 20;
      } else if (
        previousFrame &&
        previousPreviousFrame &&
        previousFrame.firstRoll === 'X' &&
        previousPreviousFrame.firstRoll === 'X'
      ) {
        previousPreviousFrame.score = 30;
      }
    }
  }

  /**
   * Calcula a pontuação do décimo frame.
   */
  calculateLastFrameScore(
    currentFrame,
    previousFrame,
    previousPreviousFrame
  ) {
    const { firstRoll, secondRoll, thirdRoll } = currentFrame;

    if (
      firstRoll === 'X' &&
      secondRoll === 'X' &&
      thirdRoll === 'X'
    ) {
      currentFrame.score = 30;
    } else if (
      firstRoll === 'X' &&
      secondRoll === 'X' &&
      thirdRoll !== null &&
      thirdRoll !== 'X'
    ) {
      currentFrame.score = 20 + thirdRoll;
    } else if (firstRoll === 'X' && thirdRoll === '/') {
      currentFrame.score = 20;
    } else if (
      firstRoll === 'X' &&
      thirdRoll !== null &&
      thirdRoll !== '/'
    ) {
      currentFrame.score = 10 + secondRoll + thirdRoll;
    } else if (secondRoll === '/' && thirdRoll === 'X') {
      currentFrame.score = 20;
    } else if (
      secondRoll === '/' &&
      thirdRoll !== null &&
      thirdRoll !== 'X'
    ) {
      currentFrame.score = 10 + thirdRoll;
    } else if (
      firstRoll !== 'X' &&
      secondRoll !== null &&
      secondRoll !== '/'
    ) {
      currentFrame.score = firstRoll + secondRoll;
    }

    this.updatePreviousFramesScore(
      currentFrame,
      previousFrame,
      previousPreviousFrame
    );
  }

  /**
   * Atualiza a pontuação dos frames anteriores com base
   * nas jogadas realizadas no décimo frame.
   */
  updatePreviousFramesScore(
    currentFrame,
    previousFrame,
    previousPreviousFrame
  ) {
    if (!previousFrame || !previousPreviousFrame) {
      return;
    }

    const { firstRoll, secondRoll, thirdRoll, score } = currentFrame;

    if (firstRoll === 'X' && secondRoll === 'X') {
      if (previousFrame.firstRoll === 'X') {
        previousFrame.score = 30;
      } else if (previousFrame.secondRoll === '/') {
        previousFrame.score = 20;
      }

      if (previousPreviousFrame.firstRoll === 'X') {
        previousPreviousFrame.score = 30;
      }

      return;
    }

    if (firstRoll === 'X' && thirdRoll === '/') {
      if (previousFrame.firstRoll === 'X') {
        previousFrame.score = 20 + secondRoll;
      } else if (previousFrame.secondRoll === '/') {
        previousFrame.score = 20;
      }

      if (previousPreviousFrame.firstRoll === 'X') {
        previousPreviousFrame.score = 30;
      }

      return;
    }

    if (firstRoll === 'X' && thirdRoll !== null) {
      if (previousFrame.firstRoll === 'X') {
        previousFrame.score = 20 + secondRoll;
      } else if (previousFrame.secondRoll === '/') {
        previousFrame.score = 20;
      }

      if (previousPreviousFrame.firstRoll === 'X') {
        previousPreviousFrame.score = 30;
      }

      return;
    }

    if (secondRoll === '/' && thirdRoll === 'X') {
      if (previousFrame.firstRoll === 'X') {
        previousFrame.score = 20;
      } else if (previousFrame.secondRoll === '/') {
        previousFrame.score = 10 + firstRoll;
      }

      return;
    }

    if (secondRoll === '/' && thirdRoll !== null) {
      if (previousFrame.firstRoll === 'X') {
        previousFrame.score = 20;

        if (previousPreviousFrame.firstRoll === 'X') {
          previousPreviousFrame.score = 20 + firstRoll;
        }
      } else if (previousFrame.secondRoll === '/') {
        previousFrame.score = 10 + firstRoll;
      }

      return;
    }

    if (firstRoll !== 'X' && secondRoll !== null && secondRoll !== '/') {
      if (previousFrame.firstRoll === 'X') {
        previousFrame.score = 10 + score;

        if (previousPreviousFrame.firstRoll === 'X') {
          previousPreviousFrame.score = 20 + firstRoll;
        }
      } else if (previousFrame.secondRoll === '/') {
        previousFrame.score = 10 + firstRoll;
      }
    }
  }

  /**
   * Retorna a pontuação total da série.
   * @returns {number}
   */
  getSeriesScore() {
    const lastFrame = this.frames[this.frames.length - 1];

    if (lastFrame.score === null) {
      throw new Error('Score cannot be taken until the end of the game');
    }

    return this.frames.reduce(
      (total, frame) => total + frame.score,
      0
    );
  }
}

/**
 * Representa um jogo de boliche com uma ou mais séries.
 */
export class Bowling {
  /**
   * @param {number} numberOfSeries Quantidade de séries do jogo.
   */
  constructor(numberOfSeries = 1) {
    this.series = [];
    this.initSeries(numberOfSeries);
  }

  /**
   * Inicializa as séries do jogo.
   */
  initSeries(numberOfSeries) {
    this.series = Array.from(
      { length: numberOfSeries },
      (_, index) => new BowlingSeries(index + 1)
    );
  }

  /**
   * Registra uma jogada em uma série.
   * @param {number} pins Quantidade de pinos derrubados.
   * @param {number} seriesId Identificador da série.
   */
  roll(pins, seriesId = 1) {
    this.series
      .find((series) => series.id === seriesId)
      .setRoll(pins);
  }

  /**
   * Retorna a pontuação de uma série.
   * @param {number} seriesId Identificador da série.
   * @returns {number}
   */
  score(seriesId = 1) {
    const series = this.series.find(
      (item) => item.id === seriesId
    );

    return series.getSeriesScore();
  }
}