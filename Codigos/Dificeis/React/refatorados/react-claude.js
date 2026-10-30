/**
 * Célula que pode ser observada e rastreia qual célula computada
 * está sendo avaliada no momento, para registrar dependências automaticamente.
 */
let currentComputation = null;

/**
 * Fila de células computadas pendentes, sem duplicatas.
 * Uma célula que já está na fila é movida para o fim ao ser adicionada novamente.
 */
class ComputeQueue {
  constructor() {
    this.items = [];
  }

  add(cell) {
    this.items = this.items.filter((item) => item !== cell);
    this.items.push(cell);
  }

  get length() {
    return this.items.length;
  }

  first() {
    return this.items[0];
  }

  removeFirst() {
    return this.items.shift();
  }
}

/**
 * Fila de callbacks pendentes, identificados pelo par (callback, célula).
 * Um callback já enfileirado é movido para o fim ao ser adicionado novamente.
 */
class CallbackQueue {
  constructor() {
    this.items = [];
  }

  add(callback, cell) {
    this.items = this.items.filter(([existing]) => existing !== callback);
    this.items.push([callback, cell]);
  }

  get length() {
    return this.items.length;
  }

  removeFirst() {
    return this.items.shift();
  }
}

const callbackQueue = new CallbackQueue();
const computeQueue = new ComputeQueue();

/**
 * Base de células reativas: guarda um valor, registra os ouvintes que o leram
 * e os notifica quando o valor muda.
 */
class Reactor {
  constructor(value) {
    this._value = value;
    this.listeners = new Set();
  }

  get value() {
    if (currentComputation) {
      this.listeners.add(currentComputation);
    }
    return this._value;
  }

  /**
   * Enfileira os ouvintes dependentes e, se for a chamada raiz da propagação,
   * processa a fila de computação e depois a de callbacks.
   */
  notify() {
    const isRootPropagation = computeQueue.length === 0;

    for (const listener of this.listeners) {
      computeQueue.add(listener);
    }
    this.listeners.clear();

    if (isRootPropagation) {
      this.flushComputeQueue();
      this.flushCallbackQueue();
    }
  }

  flushComputeQueue() {
    while (computeQueue.length > 0) {
      computeQueue.first().compute();
      computeQueue.removeFirst();
    }
  }

  flushCallbackQueue() {
    while (callbackQueue.length > 0) {
      const [callback, cell] = callbackQueue.removeFirst();
      callback.compute(cell);
    }
  }
}

/**
 * Célula de entrada, cujo valor é definido diretamente pelo usuário.
 */
export class InputCell extends Reactor {
  setValue(value) {
    this._value = value;
    this.notify();
  }
}

/**
 * Célula derivada, cujo valor é calculado por uma função sobre outras células.
 */
export class ComputeCell extends Reactor {
  constructor(cells, updaterFn) {
    super(null);
    this.cells = cells;
    this.updaterFn = updaterFn;
    this.callbacks = new Set();
    this.compute();
  }

  /**
   * Recalcula o valor, registrando como dependências as células lidas
   * durante a execução de updaterFn. Se o valor mudou, propaga a alteração.
   */
  compute() {
    const previousComputation = currentComputation;
    currentComputation = this;

    const previousValue = this._value;
    this._value = this.updaterFn(this.cells);

    currentComputation = previousComputation;

    if (this._value !== previousValue) {
      this.notify();
      for (const callback of this.callbacks) {
        callbackQueue.add(callback, this);
      }
    }
  }

  addCallback(callback) {
    this.callbacks.add(callback);
  }

  removeCallback(callback) {
    this.callbacks.delete(callback);
  }
}

/**
 * Callback que acumula os valores produzidos sempre que é acionado
 * por uma célula observada.
 */
export class CallbackCell {
  constructor(fn) {
    this.fn = fn;
    this.values = [];
  }

  compute(cell) {
    this.values.push(this.fn(cell));
  }
}