const TREE_DEPTH = 8;

function createTree(level, value = 1) {
    if (level === 0) return { value, left: null, right: null };
    return {
        value,
        left: createTree(level - 1, value * 2),
        right: createTree(level - 1, value * 2 + 1)
    };
}

const TREE = createTree(TREE_DEPTH);
const NAVIGATION_ROUNDS = 8;

export function execute(solutionModule) {
    const { Zipper } = solutionModule;
    if (typeof Zipper !== "function") {
        throw new Error("A classe Zipper não foi encontrada.");
    }

    // O código original é mutável e retorna nós; algumas refatorações
    // são imutáveis e retornam novas instâncias de Zipper. Em ambos os
    // casos, left()/up() retornam o próximo foco, então encadeamos o retorno.
    let cursor = Zipper.fromTree(TREE);
    let checksum = 0;

    for (let round = 0; round < NAVIGATION_ROUNDS; round++) {
        for (let step = 0; step < TREE_DEPTH; step++) {
            const next = cursor.left();
            if (next) cursor = next;
        }
        checksum += cursor.value();

        for (let step = 0; step < TREE_DEPTH; step++) {
            const next = cursor.up();
            if (next) cursor = next;
        }
        checksum += cursor.value();
    }

    return checksum;
}
