const FREE_SLOT = Symbol('FREE_SLOT');

/**
 * Classe base para os erros do buffer circular.
 */
class CircularBufferError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
        Error.captureStackTrace(this, new.target);
    }
}

export class BufferFullError extends CircularBufferError {
    constructor() {
        super('Buffer full');
    }
}

export class BufferEmptyError extends CircularBufferError {
    constructor() {
        super('Buffer empty');
    }
}

const createFreeSlots = (length) => Array(length).fill(FREE_SLOT);

/**
 * Controla as posições de leitura e escrita, avançando-as de forma circular.
 */
class CircularIndex {
    #length;

    constructor(length) {
        this.#length = length;
        this.read = 0;
        this.write = 0;
    }

    #next(position) {
        return (position + 1) % this.#length;
    }

    advanceRead() {
        this.read = this.#next(this.read);
    }

    advanceWrite() {
        this.write = this.#next(this.write);
    }
}

class CircularBuffer {
    #slots;
    #indexes;

    constructor(length) {
        this.length = length;
        this.#indexes = new CircularIndex(length);
        this.#slots = createFreeSlots(length);
    }

    isFull() {
        return this.#slots[this.#indexes.write] !== FREE_SLOT;
    }

    isEmpty() {
        return this.#slots[this.#indexes.read] === FREE_SLOT;
    }

    /**
     * Lê e remove o valor mais antigo do buffer.
     * @throws {BufferEmptyError} se o buffer estiver vazio.
     */
    read() {
        if (this.isEmpty()) {
            throw new BufferEmptyError();
        }

        const value = this.#slots[this.#indexes.read];
        this.#slots[this.#indexes.read] = FREE_SLOT;
        this.#indexes.advanceRead();
        return value;
    }

    /**
     * Escreve um valor. Se o buffer estiver cheio, sobrescreve o valor mais antigo.
     * Valores falsy são ignorados.
     */
    forceWrite(value) {
        if (!value) return;

        if (this.isFull()) {
            this.#indexes.advanceRead();
        }
        this.#put(value);
    }

    /**
     * Escreve um valor se houver espaço livre.
     * Valores falsy são ignorados.
     * @throws {BufferFullError} se o buffer estiver cheio.
     */
    write(value) {
        if (!value) return;
        if (this.isFull()) {
            throw new BufferFullError();
        }
        this.#put(value);
    }

    clear() {
        this.#slots = createFreeSlots(this.length);
    }

    #put(value) {
        this.#slots[this.#indexes.write] = value;
        this.#indexes.advanceWrite();
    }
}

/**
 * Cria um buffer circular de tamanho fixo.
 * @param {number} length
 * @returns {CircularBuffer}
 */
export default function circularBuffer(length) {
    return new CircularBuffer(length);
}