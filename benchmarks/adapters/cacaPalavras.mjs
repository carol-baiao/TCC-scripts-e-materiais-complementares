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
    "clojure", "elixir", "ecmascript", "rust",
    "java", "lua", "ruby", "hello"
];

// Repetimos a mesma bateria para aumentar o trabalho de busca
// sem alterar o problema, a grade ou as palavras pesquisadas.
const SEARCH_ROUNDS = 1;

export function execute(solutionModule) {
    const WordSearch = solutionModule.default;
    if (typeof WordSearch !== "function") {
        throw new Error("A classe WordSearch não foi encontrada.");
    }

    let totalFound = 0;
    for (let round = 0; round < SEARCH_ROUNDS; round++) {
        const wordSearch = new WordSearch(PUZZLE_GRID);
        const result = wordSearch.find(WORDS);
        if (Array.isArray(result)) totalFound += result.length;
        else if (result && typeof result === "object") totalFound += Object.keys(result).length;
    }
    return totalFound;
}
