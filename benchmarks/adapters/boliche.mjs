export function execute(solutionModule) {
    const { Bowling } = solutionModule;

    if (typeof Bowling !== "function") {
        throw new Error("A classe Bowling não foi encontrada.");
    }

    const game = new Bowling();

    // Partida com strikes, spares e frames abertos.
    const rolls = [
        10, 7, 2, 9, 0,
        10, 0, 8, 8, 2,
        0, 6, 10, 10, 10,
        7, 3
    ];

    for (const pins of rolls) {
        game.roll(pins);
    }

    return game.score();
}