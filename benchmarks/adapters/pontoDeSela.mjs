const MATRIX = [
    [9, 8, 7, 8, 9, 9, 9, 9],
    [5, 3, 2, 4, 3, 1, 2, 4],
    [6, 6, 7, 1, 3, 4, 5, 6],
    [8, 5, 2, 3, 1, 6, 4, 7],
    [7, 4, 6, 2, 9, 2, 5, 1],
    [9, 2, 3, 7, 4, 8, 6, 5],
    [6, 9, 1, 2, 5, 3, 8, 4],
    [8, 7, 3, 5, 2, 4, 1, 6]
];

export function execute(solutionModule) {
    const { saddlePoints } = solutionModule;

    if (typeof saddlePoints !== "function") {
        throw new Error("A função saddlePoints não foi encontrada.");
    }

    const points = saddlePoints(MATRIX);
    return points;
}
