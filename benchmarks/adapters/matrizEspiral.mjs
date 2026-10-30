const SIZE = 8;

export function execute(solutionModule) {
    const { spiralMatrix } = solutionModule;

    if (typeof spiralMatrix !== "function") {
        throw new Error("A função spiralMatrix não foi encontrada.");
    }

    const matrix = spiralMatrix(SIZE);
    return matrix.flat().reduce((total, value) => total + value, 0);
}
