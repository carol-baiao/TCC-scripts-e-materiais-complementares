// ---------------------------------------------------------------------------
// Estado global de rastreamento de dependências.
// `currentListener` guarda a célula que está sendo computada no momento,
// permitindo que `Reactor.value` registre automaticamente a dependência.
// ---------------------------------------------------------------------------
let currentListener = null;

// ---------------------------------------------------------------------------
// Fila genérica com semântica "move para o fim se já existir".
// Usada tanto para células de computação quanto para callbacks pendentes.
// ---------------------------------------------------------------------------
class UniqueQueue {
  constructor() {
    this.items = [];
  }

  get length() {
    return this.items.length;
  }

  /** Reinsere o item no fim da fila, removendo ocorrências anteriores. */
  enqueue(item) {
    this.items = this.items.filter((existing) => existing !== item);
    this.items.push(item);
  }

  /** Remove e retorna o primeiro item. */
  dequeue() {
    return this.items.shift();
  }

  /** Espia o primeiro item sem removê-lo. */
  peek() {
    return this.items[0];
  }
}

// Fila de células que precisam ser (re)computadas.
const computeQueue = new UniqueQueue();

// Fila de callbacks pendentes. Cada entrada é { callback, cell }.
// A deduplicação é feita pelo callback (mesma semântica do código original).
const callbackQueue = {
  items: [],
  get length() {
    return this.items.length;
  },
  enqueue(callback, cell) {
    this.items = this.items.filter(([cb]) => cb !== callback);
    this.items.push([callback, cell]);
  },
  dequeue() {
    return this.items.shift();
  },
};

// ---------------------------------------------------------------------------
// Reactor: nó base do grafo reativo. Armazena um valor e um conjunto de
// dependentes (outros Reactors) que devem ser notificados quando ele muda.
// ---------------------------------------------------------------------------
class Reactor {
  constructor(value) {
    this._value = value;
    this.dependents = new Set();
  }

  get value() {
    // Registra dependência automática durante uma computação.
    if (currentListener) {
      this.dependents.add(currentListener);
    }
    return this._value;
  }

  /**
   * Marca todos os dependentes para recomputação e, se esta for a raiz da
   * cascata (nenhuma computação em andamento), drena as filas até estabilizar.
   */
  notify() {
    const isRoot = computeQueue.length === 0;

    for (const dependent of this.dependents) {
      computeQueue.enqueue(dependent);
    }
    this.dependents.clear();

    if (isRoot) {
      this.drainQueues();
    }
  }

  /** Processa todas as computações e callbacks pendentes. */
  drainQueues() {
    while (computeQueue.length > 0) {
      computeQueue.dequeue().compute();
    }
    while (callbackQueue.length > 0) {
      const [callback, cell] = callbackQueue.dequeue();
      callback.compute(cell);
    }
  }
}

// ---------------------------------------------------------------------------
// InputCell: valor fornecido externamente.
// ---------------------------------------------------------------------------
export class InputCell extends Reactor {
  setValue(value) {
    this._value = value;
    this.notify();
  }
}

// ---------------------------------------------------------------------------
// ComputeCell: valor derivado de outras células via `fn`.
// ---------------------------------------------------------------------------
export class ComputeCell extends Reactor {
  constructor(cells, fn) {
    super(null);
    this.cells = cells;
    this.fn = fn;
    this.callbacks = new Set();
    this.compute();
  }

  compute() {
    const previousListener = currentListener;
    const previousValue = this._value;

    currentListener = this;
    try {
      this._value = this.fn(this.cells);
    } finally {
      currentListener = previousListener;
    }

    if (this._value === previousValue) return;

    this.notify();
    for (const callback of this.callbacks) {
      callbackQueue.enqueue(callback, this);
    }
  }

  addCallback(cb) {
    this.callbacks.add(cb);
  }

  removeCallback(cb) {
    this.callbacks.delete(cb);
  }
}

// ---------------------------------------------------------------------------
// CallbackCell: coleta resultados de um callback disparado por mudanças.
// ---------------------------------------------------------------------------
export class CallbackCell {
  constructor(fn) {
    this.fn = fn;
    this.values = [];
  }

  compute(cell) {
    this.values.push(this.fn(cell));
  }
}