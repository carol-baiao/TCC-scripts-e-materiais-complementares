// Gerenciador encapsulado para a célula que está sendo avaliada no momento
const ActiveListener = {
  current: null,
  
  runWith(listener, action) {
    const previous = this.current;
    this.current = listener;
    try {
      return action();
    } finally {
      this.current = previous;
    }
  }
};

// Estrutura genérica de fila que mantém elementos únicos (baseado em um identificador)
class UniqueQueue {
  constructor() {
    this.items = [];
  }

  get length() {
    return this.items.length;
  }

  enqueue(item, keyExtractor = (i) => i) {
    const key = keyExtractor(item);
    this.items = this.items.filter((existingItem) => keyExtractor(existingItem) !== key);
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0];
  }
}

class ComputeQueue extends UniqueQueue {
  add(cell) {
    this.enqueue(cell);
  }
}

class CallbackQueue extends UniqueQueue {
  add(callback, cell) {
    this.enqueue({ callback, cell }, (entry) => entry.callback);
  }
}

const computeQueue = new ComputeQueue();
const callbackQueue = new CallbackQueue();

class Reactor {
  constructor(initialValue) {
    this._value = initialValue;
    this.listeners = new Set();
  }

  get value() {
    if (ActiveListener.current) {
      this.listeners.add(ActiveListener.current);
    }
    return this._value;
  }

  notify() {
    const isRootNotification = computeQueue.length === 0;

    for (const listener of this.listeners) {
      computeQueue.add(listener);
    }
    this.listeners.clear();

    if (isRootNotification) {
      this.flushQueues();
    }
  }

  flushQueues() {
    while (computeQueue.length > 0) {
      const cell = computeQueue.dequeue();
      cell.compute();
    }

    while (callbackQueue.length > 0) {
      const { callback, cell } = callbackQueue.dequeue();
      callback.compute(cell);
    }
  }
}

export class InputCell extends Reactor {
  setValue(newValue) {
    this._value = newValue;
    this.notify();
  }
}

export class ComputeCell extends Reactor {
  constructor(inputCells, computeFn) {
    super(null);
    this.inputCells = inputCells;
    this.computeFn = computeFn;
    this.callbacks = new Set();
    this.compute();
  }

  compute() {
    const previousValue = this._value;

    this._value = ActiveListener.runWith(this, () => {
      return this.computeFn(this.inputCells);
    });

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

export class CallbackCell {
  constructor(callbackFn) {
    this.callbackFn = callbackFn;
    this.values = [];
  }

  compute(cell) {
    this.values.push(this.callbackFn(cell));
  }
}