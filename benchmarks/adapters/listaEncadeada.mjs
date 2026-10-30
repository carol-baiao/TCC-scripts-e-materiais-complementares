const VALUES = Array.from({ length: 128 }, (_, index) => index + 1);

export function execute(solutionModule) {
    const { List } = solutionModule;

    if (typeof List !== "function") {
        throw new Error("A função construtora List não foi encontrada.");
    }

    const list = new List(VALUES);
    const reversed = list.reverse();
    const result = reversed.toArray();

    return {
        length: result.length,
        first: result[0],
        last: result.at(-1),
        sum: result.reduce((total, value) => total + value, 0)
    };
}
