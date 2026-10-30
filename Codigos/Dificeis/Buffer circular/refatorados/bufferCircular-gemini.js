export class BufferFullError extends Error {
    constructor(message = 'Buffer full') {
        super(message);
        this.name = 'BufferFullError';
    }
}

export class BufferEmptyError extends Error {
    constructor(message = 'Buffer empty') {
        super(message);
        this.name = 'BufferEmptyError';
    }
}

export class CircularBuffer {
    #capacity;
    #buffer;
    #readIndex = 0;
    #writeIndex = 0;
    #size = 0;

    constructor(capacity) {
        if (!Number.isInteger(capacity) || capacity <= 0) {
            throw new TypeError('A capacidade do buffer deve ser um número inteiro positivo.');
        }

        this.#capacity = capacity;
        this.#buffer = new Array(capacity);
    }

    isFull() {
        return this.#size === this.#capacity;
    }

    isEmpty() {
        return this.#size === 0;
    }

    write(value) {
        if (value === undefined || value === null) {
            return;
        }

        if (this.isFull()) {
            throw new BufferFullError();
        }

        this.#buffer[this.#writeIndex] = value;
        this.#writeIndex = (this.#writeIndex + 1) % this.#capacity;
        this.#size++;
    }

    forceWrite(value) {
        if (value === undefined || value === null) {
            return;
        }

        if (this.isFull()) {
            this.#readIndex = (this.#readIndex + 1) % this.#capacity;
        } else {
            this.#size++;
        }

        this.#buffer[this.#writeIndex] = value;
        this.#writeIndex = (this.#writeIndex + 1) % this.#capacity;
    }

    read() {
        if (this.isEmpty()) {
            throw new BufferEmptyError();
        }

        const value = this.#buffer[this.#readIndex];
        this.#buffer[this.#readIndex] = undefined; // Libera a referência para coleta de lixo
        this.#readIndex = (this.#readIndex + 1) % this.#capacity;
        this.#size--;

        return value;
    }

    clear() {
        this.#buffer.fill(undefined);
        this.#readIndex = 0;
        this.#writeIndex = 0;
        this.#size = 0;
    }
}

export default function circularBuffer(capacity) {
    return new CircularBuffer(capacity);
}