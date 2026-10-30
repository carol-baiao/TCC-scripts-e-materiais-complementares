const FREE_SLOT = Symbol();
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
const createFreeBuffer = length => Array(length).fill(FREE_SLOT);
class ReadWriteCircularIndex {
    constructor(length) {
        this.read = 0;
        this.write = 0;
        this.length = length;
    }
    getNextIndex(current) {
        return (current + 1) % this.length;
    }
    incrementReadIndex() {
        this.read = this.getNextIndex(this.read);
    }
    incrementWriteIndex() {
        this.write = this.getNextIndex(this.write);
    }
}
class CircularBuffer {
    constructor(length) {
        this.length = length;
        this.index = new ReadWriteCircularIndex(length);
        this.initInternal();
    }
    isFull() {
        return this.internal[this.index.write] !== FREE_SLOT;
    }
    isEmpty() {
        return this.internal[this.index.read] === FREE_SLOT;
    }
    initInternal() {
        this.internal = createFreeBuffer(this.length);
    }
    freeReadSlot() {
        this.internal[this.index.read] = FREE_SLOT;
    }
    internalWrite(value) {
        this.internal[this.index.write] = value;
    }
    read() {
        if (this.isEmpty()) {
            throw new BufferEmptyError();
        }
        const value = this.internal[this.index.read];
        this.freeReadSlot();
        this.index.incrementReadIndex();
        return value;
    }
    forceWrite(value) {
        if (!value) { return; }
        if (!this.isFull()) {
            return this.write(value);
        }
        this.internalWrite(value);
        this.index.incrementReadIndex();
        this.index.incrementWriteIndex();
    }
    write(value) {
        if (!value) { return; }
        if (this.isFull()) {
            throw new BufferFullError();
        }
        this.internalWrite(value);
        this.index.incrementWriteIndex();
    }
    clear() {
        this.initInternal();
    }
}
export default function circularBuffer(length) {
    return new CircularBuffer(length);
}
