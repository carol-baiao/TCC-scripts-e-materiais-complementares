const FREE_SLOT = Symbol('freeSlot');

export class BufferFullError extends Error {
    constructor() {
        super('Buffer full');
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BufferEmptyError extends Error {
    constructor() {
        super('Buffer empty');
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

const createFreeBuffer = (length) => Array(length).fill(FREE_SLOT);

class CircularIndex {
    constructor(length) {
        this.read = 0;
        this.write = 0;
        this.length = length;
    }

    next(index) {
        return (index + 1) % this.length;
    }

    advanceRead() {
        this.read = this.next(this.read);
    }

    advanceWrite() {
        this.write = this.next(this.write);
    }
}

class CircularBuffer {
    constructor(length) {
        this.length = length;
        this.index = new CircularIndex(length);
        this.reset();
    }

    reset() {
        this.slots = createFreeBuffer(this.length);
    }

    isFull() {
        return this.slots[this.index.write] !== FREE_SLOT;
    }

    isEmpty() {
        return this.slots[this.index.read] === FREE_SLOT;
    }

    read() {
        if (this.isEmpty()) {
            throw new BufferEmptyError();
        }
        const value = this.slots[this.index.read];
        this.slots[this.index.read] = FREE_SLOT;
        this.index.advanceRead();
        return value;
    }

    write(value) {
        if (!value) {
            return;
        }
        if (this.isFull()) {
            throw new BufferFullError();
        }
        this.slots[this.index.write] = value;
        this.index.advanceWrite();
    }

    forceWrite(value) {
        if (!value) {
            return;
        }
        if (!this.isFull()) {
            return this.write(value);
        }
        // Buffer cheio: sobrescreve o slot atual e descarta o mais antigo
        this.slots[this.index.write] = value;
        this.index.advanceRead();
        this.index.advanceWrite();
    }

    clear() {
        this.reset();
    }
}

export default function circularBuffer(length) {
    return new CircularBuffer(length);
}