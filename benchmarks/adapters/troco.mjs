const COINS = [1, 5, 10, 25, 100];
const TARGET = 63;

export function execute(solutionModule) {
    const { Change } = solutionModule;

    if (typeof Change !== "function") {
        throw new Error("A classe Change não foi encontrada.");
    }

    const calculator = new Change();
    const change = calculator.calculate(COINS, TARGET);

    return {
        count: change.length,
        sum: change.reduce((total, coin) => total + coin, 0),
        coins: change
    };
}
