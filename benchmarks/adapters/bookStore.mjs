const BOOKS = [1, 1, 2, 2, 3, 3, 4, 5];

export function execute(solutionModule) {
    const cost = solutionModule.cost;

    if (typeof cost !== "function") {
        throw new Error(
            "A função cost() não foi encontrada."
        );
    }

    // Cria uma cópia para cada execução,
    // evitando que uma implementação altere a entrada
    // utilizada nas execuções seguintes.
    return cost([...BOOKS]);
}
