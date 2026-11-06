// ============================================================================
// Constantes
// ============================================================================

const MAX_PINS = 10;
const TOTAL_FRAMES = 10;
const STRIKE = 'X';
const SPARE = '/';
const FIRST_FRAME_ID = 1;
const LAST_FRAME_ID = TOTAL_FRAMES;

const ERRORS = {
  NEGATIVE_ROLL: 'Negative roll is invalid',
  EXCEEDS_PINS: 'Pin count exceeds pins on the lane',
  GAME_OVER: 'Cannot roll after game is over',
  INCOMPLETE_GAME: 'Score cannot be taken until the end of the game',
};

// ============================================================================
// Helpers puros
// ============================================================================

const isStrike = (roll) => roll === STRIKE;
const isSpare = (roll) => roll === SPARE;
const isNumber = (value) => typeof value === 'number';
const isNullish = (value) => value === null || value === undefined;
const rollToPins = (roll) => (isNumber(roll) ? roll : 0);

// ============================================================================
// Frame
// ============================================================================

class Frame {
  constructor(id) {
    this.id = id;
    this.firstRoll = null;
    this.secondRoll = null;
    this.score = null;
  }

  get isLast() {
    return this.id === LAST_FRAME_ID;
  }

  get isStrike() {
    return isStrike(this.firstRoll);
  }

  get isSpare() {
    return isSpare(this.secondRoll);
  }
}

class LastFrame extends Frame {
  constructor() {
    super(LAST_FRAME_ID);
    this.thirdRoll = null;
  }
}

// ============================================================================
// Cálculo de pontuação
// ============================================================================

function computeFrameScore(frame, frames) {
  const idx = frame.id - 1;
  const next = frames[idx + 1];
  const nextNext = frames[idx + 2];

  if (!frame.isLast) {
    if (frame.isStrike) {
      if (!next) return null;
      const bonus = strikeBonus(next, nextNext);
      return bonus === null ? null : MAX_PINS + bonus;
    }
    if (frame.isSpare) {
      if (!next || isNullish(next.firstRoll)) return null;
      return MAX_PINS + rollToPins(next.firstRoll);
    }
    if (isNullish(frame.firstRoll) || isNullish(frame.secondRoll)) return null;
    return frame.firstRoll + frame.secondRoll;
  }

  return computeLastFrameScore(frame);
}

function strikeBonus(next, nextNext) {
  if (next.isStrike) {
    if (next.isLast) {
      return isNullish(next.secondRoll) ? null : MAX_PINS + rollToPins(next.secondRoll);
    }
    if (!nextNext || isNullish(nextNext.firstRoll)) return null;
    return MAX_PINS + rollToPins(nextNext.firstRoll);
  }
  if (isNullish(next.secondRoll)) return null;
  return rollToPins(next.firstRoll) + rollToPins(next.secondRoll);
}

function computeLastFrameScore(frame) {
  const { firstRoll, secondRoll, thirdRoll } = frame;
  if (isNullish(firstRoll) || isNullish(secondRoll)) return null;

  const first = rollToPins(firstRoll);
  const second = rollToPins(secondRoll);
  const isFirstStrike = isStrike(firstRoll);
  const isSecondSpare = isSpare(secondRoll);

  if (isFirstStrike || isSecondSpare) {
    if (isNullish(thirdRoll)) return null;
  }

  if (isFirstStrike) {
    if (isStrike(secondRoll)) {
      if (isNullish(thirdRoll)) return null;
      return isStrike(thirdRoll) ? 30 : 20 + rollToPins(thirdRoll);
    }
    if (isSecondSpare) return 20;
    return MAX_PINS + second + rollToPins(thirdRoll);
  }

  if (isSecondSpare) {
    return MAX_PINS + rollToPins(thirdRoll);
  }

  return first + second;
}

// ============================================================================
// BowlingSeries
// ============================================================================

class BowlingSeries {
  constructor(id) {
    this.id = id;
    this.frames = this.createFrames();
  }

  createFrames() {
    const frames = [];
    for (let i = FIRST_FRAME_ID; i < LAST_FRAME_ID; i++) {
      frames.push(new Frame(i));
    }
    frames.push(new LastFrame());
    return frames;
  }

  /**
   * Encontra o próximo frame que ainda aceita um roll.
   * Espelha a lógica original de getNextFrame.
   */
  findNextFrame() {
    return this.frames.find((frame) => {
      const isLast = frame.isLast;

      if (isLast) {
        // 10º frame, terceiro roll pendente
        if (
          !isNullish(frame.firstRoll) &&
          !isNullish(frame.secondRoll) &&
          isNullish(frame.thirdRoll) &&
          frame.score === null
        ) {
          return true;
        }
        // 10º frame, segundo roll pendente
        if (
          !isNullish(frame.firstRoll) &&
          isNullish(frame.secondRoll) &&
          isNullish(frame.thirdRoll)
        ) {
          return true;
        }
        // 10º frame, primeiro roll pendente
        if (isNullish(frame.firstRoll)) return true;
        return false;
      }

      // Frames 1..9: segundo roll pendente (primeiro < 10)
      if (frame.firstRoll <= 9 && isNullish(frame.secondRoll)) return true;
      // Frames 1..9: primeiro roll pendente
      if (isNullish(frame.firstRoll)) return true;
      return false;
    });
  }

  setRoll(pins) {
    this.validatePins(pins);

    const frame = this.findNextFrame();
    if (!frame) throw new Error(ERRORS.GAME_OVER);

    this.applyRoll(frame, pins);
    this.recalculateScores();
  }

  validatePins(pins) {
    if (pins < 0) throw new Error(ERRORS.NEGATIVE_ROLL);
    if (pins > MAX_PINS) throw new Error(ERRORS.EXCEEDS_PINS);
  }

  applyRoll(frame, pins) {
    if (isNullish(frame.firstRoll)) {
      frame.firstRoll = pins === MAX_PINS ? STRIKE : pins;
      return;
    }

    if (isNullish(frame.secondRoll)) {
      // Segundo roll (frames 1..9 OU 10º frame após strike)
      if (frame.isStrike && !frame.isLast) {
        // Não deveria ocorrer: strike em frame 1..9 fecha o frame
        throw new Error(ERRORS.EXCEEDS_PINS);
      }
      if (pins === MAX_PINS) {
        frame.secondRoll = STRIKE; // só válido no 10º frame após strike
        return;
      }
      const firstPins = rollToPins(frame.firstRoll);
      if (firstPins + pins === MAX_PINS) {
        frame.secondRoll = SPARE;
        return;
      }
      if (firstPins + pins > MAX_PINS) {
        throw new Error(ERRORS.EXCEEDS_PINS);
      }
      frame.secondRoll = pins;
      return;
    }

    // Terceiro roll (somente 10º frame)
    if (frame.thirdRoll !== null && frame.thirdRoll !== undefined) {
      throw new Error(ERRORS.GAME_OVER);
    }

    if (pins === MAX_PINS) {
      // Se o segundo roll foi numérico (caso X n m), não pode ser strike
      if (isNumber(frame.secondRoll)) {
        throw new Error(ERRORS.EXCEEDS_PINS);
      }
      frame.thirdRoll = STRIKE;
      return;
    }

    const secondPins = rollToPins(frame.secondRoll);
    if (secondPins + pins === MAX_PINS) {
      frame.thirdRoll = SPARE;
      return;
    }
    if (secondPins + pins > MAX_PINS) {
      throw new Error(ERRORS.EXCEEDS_PINS);
    }
    frame.thirdRoll = pins;
  }

  recalculateScores() {
    this.frames.forEach((frame) => {
      frame.score = null;
    });
    for (const frame of this.frames) {
      const score = computeFrameScore(frame, this.frames);
      if (score === null) break;
      frame.score = score;
    }
  }

  getSeriesScore() {
    const lastFrame = this.frames[this.frames.length - 1];
    if (lastFrame.score === null) {
      throw new Error(ERRORS.INCOMPLETE_GAME);
    }
    return this.frames.reduce((sum, frame) => sum + (frame.score ?? 0), 0);
  }
}

// ============================================================================
// Bowling (API pública)
// ============================================================================

export class Bowling {
  constructor(numberOfSeries = 1) {
    this.series = Array.from(
      { length: numberOfSeries },
      (_, i) => new BowlingSeries(i + 1)
    );
  }

  getSeries(seriesId) {
    const series = this.series.find((s) => s.id === seriesId);
    if (!series) throw new Error(`Series ${seriesId} not found`);
    return series;
  }

  roll(pins, seriesId = 1) {
    this.getSeries(seriesId).setRoll(pins);
  }

  score(seriesId = 1) {
    return this.getSeries(seriesId).getSeriesScore();
  }
}