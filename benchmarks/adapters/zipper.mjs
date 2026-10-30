const TREE = {
    value: 10,
    left: {
        value: 5,
        left: { value: 2, left: null, right: null },
        right: { value: 7, left: null, right: null }
    },
    right: {
        value: 15,
        left: { value: 12, left: null, right: null },
        right: { value: 20, left: null, right: null }
    }
};

export function execute(solutionModule) {
    const { Zipper } = solutionModule;

    if (typeof Zipper !== "function") {
        throw new Error("A classe Zipper não foi encontrada.");
    }

    const zipper = Zipper.fromTree(TREE);
    zipper.left();
    const leftValue = zipper.value();
    zipper.up();
    const rootValue = zipper.value();

    // Não chamamos toTree(): o código original imprime mensagens de depuração nesse método.
    return { leftValue, rootValue, checksum: leftValue + rootValue };
}
