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

/**
 * Converte um resultado de roll em valor numérico de pinos derrubados.
 * Strikes e spares só são convertidos quando há contexto (frame anterior).
 */
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

  /** Todos os rolls obrigatórios do frame foram feitos? */
  get isComplete() {
    if (this.isLast) {
      // Último frame: completo quando não há mais roll esperado
      if (isNullish(this.firstRoll)) return false;
      const isStrikeOrSpare = this.isStrike || this.isSpare;
      if (!isStrikeOrSpare) return !isNullish(this.secondRoll);
      return !isNullish(this.thirdRoll);
    }
    return !isNullish(this.firstRoll) && !isNullish(this.secondRoll);
  }
}

class LastFrame extends Frame {
  constructor() {
    super(LAST_FRAME_ID);
    this.thirdRoll = null;
  }
}

// ============================================================================
// Cálculo de pontuação — funções puras por caso
// ============================================================================

/**
 * Calcula o score "cru" do frame (sem bônus de strikes/spares futuros),
 * quando possível. Retorna `null` se ainda depende de rolls futuros.
 */
function computeFrameScore(frame, frames) {
  const idx = frame.id - 1;
  const prev = frames[idx - 1];
  const prevPrev = frames[idx - 2];
  const next = frames[idx + 1];

  if (!frame.isLast) {
    // ---- Frames 1..9 ----
    if (frame.isStrike) {
      if (!next) return null;
      const bonus = strikeBonus(next, frames[idx + 2]);
      return bonus === null ? null : MAX_PINS + bonus;
    }

    if (frame.isSpare) {
      if (!next || isNullish(next.firstRoll)) return null;
      return MAX_PINS + rollToPins(next.firstRoll);
    }

    // Open frame
    if (isNullish(frame.firstRoll) || isNullish(frame.secondRoll)) return null;
    return frame.firstRoll + frame.secondRoll;
  }

  // ---- Frame 10 ----
  return computeLastFrameScore(frame);
}

/**
 * Bônus para um strike: soma dos próximos dois rolls
 * (considerando que podem estar em frames diferentes).
 */
function strikeBonus(next, nextNext) {
  // Se o próximo frame for strike, precisamos do roll seguinte a ele.
  if (next.isStrike) {
    if (next.isLast) {
      return isNullish(next.secondRoll) ? null : MAX_PINS + rollToPins(next.secondRoll);
    }
    if (!nextNext || isNullish(nextNext.firstRoll)) return null;
    return MAX_PINS + rollToPins(nextNext.firstRoll);
  }
  // Próximo frame não é strike: precisamos dos dois primeiros rolls dele.
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
    // X X X | X X n | X n / | X n m
    if (isStrike(secondRoll)) {
      if (isNullish(thirdRoll)) return null;
      return isStrike(thirdRoll) ? 30 : 20 + rollToPins(thirdRoll);
    }
    if (isSecondSpare) return 20;
    return MAX_PINS + second + rollToPins(thirdRoll);
  }

  if (isSecondSpare) {
    // n / X | n / m
    return MAX_PINS + rollToPins(thirdRoll);
  }

  // Open frame (sem bônus)
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

  /** Encontra o próximo frame que ainda aceita um roll. */
  findNextFrame() {
    return this.frames.find((frame) => !frame.isComplete);
  }

  /**
   * Determina qual slot do frame deve receber o roll.
   * Retorna a chave ('firstRoll' | 'secondRoll' | 'thirdRoll') ou null.
   */
  static resolveRollSlot(frame) {
    if (isNullish(frame.firstRoll)) return 'firstRoll';
    if (isNullish(frame.secondRoll)) return 'secondRoll';
    if (frame.isLast && isNullish(frame.thirdRoll)) return 'thirdRoll';
    return null;
  }

  setRoll(pins) {
    this.validatePins(pins);

    const frame = this.findNextFrame();
    if (!frame) throw new Error(ERRORS.GAME_OVER);

    const slot = BowlingSeries.resolveRollSlot(frame);
    this.applyRoll(frame, slot, pins);

    this.recalculateScores();
  }

  validatePins(pins) {
    if (pins < 0) throw new Error(ERRORS.NEGATIVE_ROLL);
    if (pins > MAX_PINS) throw new Error(ERRORS.EXCEEDS_PINS);
  }

  applyRoll(frame, slot, pins) {
    // Validações específicas de frame
    if (slot === 'secondRoll') {
      this.validateSecondRoll(frame, pins);
    } else if (slot === 'thirdRoll') {
      this.validateThirdRoll(frame, pins);
    }

    // Registra o valor (convertendo para símbolo quando aplicável)
    frame[slot] = this.encodeRoll(frame, slot, pins);
  }

  validateSecondRoll(frame, pins) {
    if (isStrike(frame.firstRoll)) return; // strike: segundo roll é novo frame (10º)
    if (frame.firstRoll + pins > MAX_PINS) {
      throw new Error(ERRORS.EXCEEDS_PINS);
    }
  }

  validateThirdRoll(frame, pins) {
    const isFirstStrike = isStrike(frame.firstRoll);
    const isSecondStrike = isStrike(frame.secondRoll);
    const isSecondSpare = isSpare(frame.secondRoll);

    if (isFirstStrike && isSecondStrike) return; // rolls livres
    if (isFirstStrike && isSecondSpare) {
      // X n / → terceiro roll é primeiro de novo frame, sem restrição extra
      return;
    }
    if (isFirstStrike) {
      // X n m → terceiro roll já validado como parte do frame
      return;
    }
    if (isSecondSpare) {
      // n / X ou n / m → sem restrição de soma
      return;
    }
    // open frame no 10º: não deveria haver terceiro roll, mas por segurança
    if (frame.firstRoll + frame.secondRoll + pins > MAX_PINS) {
      throw new Error(ERRORS.EXCEEDS_PINS);
    }
  }

  encodeRoll(frame, slot, pins) {
    if (pins === MAX_PINS && slot !== 'secondRoll') {
      // Strike (primeiro ou terceiro roll)
      return STRIKE;
    }
    if (pins === MAX_PINS && slot === 'secondRoll') {
      // Segundo roll = 10 só é válido como strike no 10º frame (após strike)
      return STRIKE;
    }
    if (slot === 'secondRoll' && frame.firstRoll + pins === MAX_PINS) {
      return SPARE;
    }
    if (slot === 'thirdRoll' && frame.secondRoll + pins === MAX_PINS) {
      return SPARE;
    }
    return pins;
  }

  /** Recalcula o score de todos os frames (determinístico e idempotente). */
  recalculateScores() {
    // Limpa scores para evitar estado inconsistente
    this.frames.forEach((frame) => { frame.score = null; });

    for (const frame of this.frames) {
      const score = computeFrameScore(frame, this.frames);
      if (score === null) break; // frames seguintes dependem deste
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