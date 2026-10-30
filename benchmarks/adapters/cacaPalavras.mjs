
const PUZZLE_GRID = [
    "jefblpepre",
    "camdcimgtc",
    "oivokprjsm",
    "pbwasqroua",
    "rixilelhrs",
    "wolcqlirpc",
    "screeaumgr",
    "alxhpburyi",
    "jalaycalmp",
    "clojurermt"
];

const WORDS = [
    "clojure",
    "elixir",
    "ecmascript",
    "rust",
    "java",
    "lua",
    "ruby",
    "hello"
];

export function execute(solutionModule) {
    const WordSearch = solutionModule.default;

    if (typeof WordSearch !== "function") {
        throw new Error(
            "A classe WordSearch não foi encontrada."
        );
    }

    const wordSearch = new WordSearch(PUZZLE_GRID);

    return wordSearch.find(WORDS);
}