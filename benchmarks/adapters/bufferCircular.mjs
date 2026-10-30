
const CAPACITY = 8;

const INITIAL_VALUES = Array.from(
    { length: CAPACITY },
    (_, index) => `item-${index}`
);

const OVERFLOW_VALUES = Array.from(
    { length: 4 },
    (_, index) => `item-${CAPACITY + index}`
);

const REFILL_VALUES = Array.from(
    { length: 4 },
    (_, index) => `item-${CAPACITY + 4 + index}`
);

export function execute(solutionModule) {
    const createCircularBuffer = solutionModule.default;

    if (typeof createCircularBuffer !== "function") {
        throw new Error(
            "A função circularBuffer não foi encontrada."
        );
    }

    const buffer = createCircularBuffer(CAPACITY);

    // 1. Preenche o buffer com oito valores.
    for (const value of INITIAL_VALUES) {
        buffer.write(value);
    }

    // 2. Força quatro escritas com o buffer cheio.
    for (const value of OVERFLOW_VALUES) {
        buffer.forceWrite(value);
    }

    // 3. Lê quatro valores, liberando posições.
    for (let i = 0; i < OVERFLOW_VALUES.length; i++) {
        buffer.read();
    }

    // 4. Reutiliza as posições liberadas.
    for (const value of REFILL_VALUES) {
        buffer.write(value);
    }

    // 5. Lê os oito valores restantes.
    let lastResult;

    for (let i = 0; i < CAPACITY; i++) {
        lastResult = buffer.read();
    }

    return lastResult;
}
