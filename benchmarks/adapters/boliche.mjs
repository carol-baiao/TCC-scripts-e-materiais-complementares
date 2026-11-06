const GAMES = [
    // Um strike isolado, sem strike consecutivo.
    [10, 3, 4, ...Array(8).fill([4, 3]).flat()],
    // Dez spares consecutivos, incluindo a bola de preenchimento.
    Array(10).fill([5, 5]).flat().concat(5),
    // Dez frames abertos.
    Array(10).fill([4, 3]).flat()
];

export function execute(solutionModule) {
    const { Bowling } = solutionModule;
    if (typeof Bowling !== "function") {
        throw new Error("A classe Bowling não foi encontrada.");
    }

    let checksum = 0;
    for (const rolls of GAMES) {
        const game = new Bowling();
        for (const pins of rolls) game.roll(pins);
        checksum += game.score();
    }
    return checksum;
}
