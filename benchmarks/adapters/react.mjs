const COMPUTE_DEPTH = 32;
const SOURCE_UPDATES = 8;

export function execute(solutionModule) {
    const { InputCell, ComputeCell, CallbackCell } = solutionModule;
    if (
        typeof InputCell !== "function" ||
        typeof ComputeCell !== "function" ||
        typeof CallbackCell !== "function"
    ) {
        throw new Error("As classes InputCell, ComputeCell ou CallbackCell não foram encontradas.");
    }

    const source = new InputCell(1);
    let current = new ComputeCell([source], ([cell]) => cell.value * 2);

    for (let index = 0; index < COMPUTE_DEPTH; index++) {
        const increment = index + 1;
        current = new ComputeCell([current], ([cell]) => cell.value + increment);
    }

    const callback = new CallbackCell(cell => cell.value);
    current.addCallback(callback);

    for (let update = 0; update < SOURCE_UPDATES; update++) {
        source.setValue(update + 2);
    }

    return {
        value: current.value,
        notifications: callback.values.length
    };
}
