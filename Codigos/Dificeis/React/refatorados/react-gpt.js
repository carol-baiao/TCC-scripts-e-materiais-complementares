
let activeListener = null;

class ComputeQueue {
  constructor() {
    this.queue = [];
  }

  add(cell) {
    this.queue = this.queue.filter((item) => item !== cell);
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
    this.queue = this.queue.filter(
      ([queuedCallback]) => queuedCallback !== callback
    );

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
    if (activeListener) {
      this.listeners.add(activeListener);
    }

    return this._value;
  }

  notify() {
    const isRootNotification = computeQueue.length === 0;

    for (const dependentCell of this.listeners) {
      computeQueue.add(dependentCell);
    }

    this.listeners.clear();

    if (!isRootNotification) {
      return;
    }

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
    const previousListener = activeListener;
    activeListener = this;

    const previousValue = this._value;
    this._value = this.updaterFn(this.cells);

    activeListener = previousListener;

    if (this._value === previousValue) {
      return;
    }

    this.notify();

    for (const callback of this.callbacks) {
      callbackQueue.add(callback, this);
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
  constructor(fn) {
    this.fn = fn;
    this.values = [];
  }

  compute(cell) {
    this.values.push(this.fn(cell));
  }
}
