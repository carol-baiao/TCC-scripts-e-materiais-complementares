const DIGITS = "73167176531330624919225119674426574742355349194934";
const SPAN = 5;

export function execute(solutionModule) {
    const { largestProduct } = solutionModule;

    if (typeof largestProduct !== "function") {
        throw new Error("A função largestProduct não foi encontrada.");
    }

    return largestProduct(DIGITS, SPAN);
}
