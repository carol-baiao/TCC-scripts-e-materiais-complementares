const SIZE = 512;
const VALUES = Array.from({ length: SIZE }, (_, index) => index + 1);

export function execute(solutionModule) {
    const { List } = solutionModule;
    if (typeof List !== "function") {
        throw new Error("A função construtora List não foi encontrada.");
    }

    const list = new List(VALUES);
    const reversed = list.reverse();
    const result = reversed.toArray();

    let sum = 0;
    for (const value of result) sum += value;

    return {
        length: result.length,
        first: result[0],
        last: result[result.length - 1],
        sum
    };
}
