const CAPACITY = 512;
const INITIAL_VALUES = Array.from({ length: CAPACITY }, (_, i) => i);
const OVERFLOW_VALUES = Array.from({ length: CAPACITY / 2 }, (_, i) => CAPACITY + i);
const REFILL_VALUES = Array.from({ length: CAPACITY / 2 }, (_, i) => CAPACITY * 2 + i);

export function execute(solutionModule) {
    const createCircularBuffer = solutionModule.default;
    if (typeof createCircularBuffer !== "function") {
        throw new Error("A função circularBuffer não foi encontrada.");
    }

    const buffer = createCircularBuffer(CAPACITY);
    for (const value of INITIAL_VALUES) buffer.write(value);
    for (const value of OVERFLOW_VALUES) buffer.forceWrite(value);
    for (let i = 0; i < OVERFLOW_VALUES.length; i++) buffer.read();
    for (const value of REFILL_VALUES) buffer.write(value);

    let checksum = 0;
    for (let i = 0; i < CAPACITY; i++) {
        const value = buffer.read();
        if (typeof value === "number") checksum += value;
    }
    return checksum;
}
