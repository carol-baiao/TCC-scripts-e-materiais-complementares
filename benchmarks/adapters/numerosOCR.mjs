const GLYPHS = {
    "0": [" _ ", "| |", "|_|"],
    "1": ["   ", "  |", "  |"],
    "2": [" _ ", " _|", "|_ "],
    "3": [" _ ", " _|", " _|"],
    "4": ["   ", "|_|", "  |"],
    "5": [" _ ", "|_ ", " _|"],
    "6": [" _ ", "|_ ", "|_|"],
    "7": [" _ ", "  |", "  |"],
    "8": [" _ ", "|_|", "|_|"],
    "9": [" _ ", "|_|", " _|"]
};
const DIGITS = "0123456789";
const OCR_INPUT = [0, 1, 2].map(row =>
    [...DIGITS].map(digit => GLYPHS[digit][row]).join("")
).join("\n") + "\n";

export function execute(solutionModule) {
    const { convert } = solutionModule;

    if (typeof convert !== "function") {
        throw new Error("A função convert não foi encontrada.");
    }

    return convert(OCR_INPUT);
}
