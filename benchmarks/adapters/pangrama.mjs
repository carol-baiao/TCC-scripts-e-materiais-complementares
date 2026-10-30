// Menor caso positivo simples: cada letra do alfabeto aparece exatamente uma vez.
const TEXT = "abcdefghijklmnopqrstuvwxyz";

export function execute(solutionModule) {
    const { isPangram } = solutionModule;

    if (typeof isPangram !== "function") {
        throw new Error("A função isPangram não foi encontrada.");
    }

    return isPangram(TEXT);
}
