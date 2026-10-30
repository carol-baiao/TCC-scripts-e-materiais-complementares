let listener = null;

class ComputeQueue {
  constructor() {
    this.queue = [];
  }

  add(cell) {
    this.queue = this.queue.filter((c) => c !== cell);
    this.queue.push(cell);
  }

  get length() {
    return this.queue.length;
  }

  first() {
    return this.queue[0];
  }

  shift() {
    return this.queue.shift();
  }
}

class CallbackQueue {
  constructor() {
    this.queue = [];
  }

  add(callback, cell) {
    this.queue = this.queue.filter(([cb]) => cb !== callback);
    this.queue.push([callback, cell]);
  }

  get length() {
    return this.queue.length;
  }

  shift() {
    return this.queue.shift();
  }
}

const callbackQueue = new CallbackQueue();
const computeQueue = new ComputeQueue();

class Reactor {
  constructor(value) {
    this._value = value;
    this.listeners = new Set();
  }

  get value() {
    if (listener) {
      this.listeners.add(listener);
    }
    return this._value;
  }

  notify() {
    const root = computeQueue.length === 0;
    for (const listener of this.listeners) {
      computeQueue.add(listener);
    }
    this.listeners.clear();
    if (root) {
      while (computeQueue.length > 0) {
        computeQueue.first().compute();
        computeQueue.shift();
      }
      while (callbackQueue.length > 0) {
        const [callback, cell] = callbackQueue.shift();
        callback.compute(cell);
      }
    }
  }
}

export class InputCell extends Reactor {
  constructor(value) {
    super(value);
  }

  setValue(value) {
    this._value = value;
    this.notify();
  }
}

export class ComputeCell extends Reactor {
  constructor(cells, fn) {
    super(null);
    this.cells = cells;
    this.updaterFn = fn;
    this.callbacks = new Set();
    this.compute();
  }

  compute() {
    const previousListener = listener;
    listener = this;
    const previousValue = this._value;
    this._value = this.updaterFn(this.cells);
    listener = previousListener;
    if (this._value !== previousValue) {
      this.notify();
      for (const callback of this.callbacks) {
        callbackQueue.add(callback, this);
      }
    }
  }

  addCallback(cb) {
    this.callbacks.add(cb);
  }

  removeCallback(cb) {
    this.callbacks.delete(cb);
  }
}

export class CallbackCell {
  constructor(fn) {
    this.fn = fn;
    this.values = [];
  }

  compute(cell) {
    this.values.push(this.fn(cell));
  }
}