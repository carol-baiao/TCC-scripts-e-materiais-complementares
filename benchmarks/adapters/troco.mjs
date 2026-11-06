// Casos em que a estratégia gulosa pode falhar e o algoritmo
// precisa recorrer à busca exaustiva. Todas as entradas têm solução.
const COINS = [7, 4, 3];
const TARGETS = Array.from({ length: 8 }, (_, index) => 6 + index);

export function execute(solutionModule) {
    const { Change } = solutionModule;
    if (typeof Change !== "function") {
        throw new Error("A classe Change não foi encontrada.");
    }

    let checksum = 0;
    for (const target of TARGETS) {
        const calculator = new Change();
        const change = calculator.calculate(COINS, target);
        checksum += change.length;
        for (const coin of change) checksum += coin;
    }
    return checksum;
}
