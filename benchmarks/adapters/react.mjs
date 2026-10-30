const COMPUTE_DEPTH = 12;

export function execute(solutionModule) {
    const { InputCell, ComputeCell, CallbackCell } = solutionModule;

    if (
        typeof InputCell !== "function" ||
        typeof ComputeCell !== "function" ||
        typeof CallbackCell !== "function"
    ) {
        throw new Error("As classes InputCell, ComputeCell ou CallbackCell não foram encontradas.");
    }

    const source = new InputCell(2);
    let current = new ComputeCell([source], ([cell]) => cell.value * 2);

    for (let index = 0; index < COMPUTE_DEPTH; index++) {
        const increment = index + 1;
        current = new ComputeCell(
            [current],
            ([cell]) => cell.value + increment
        );
    }

    const callback = new CallbackCell(cell => cell.value);
    current.addCallback(callback);

    source.setValue(5);
    source.setValue(7);

    return {
        value: current.value,
        notifications: callback.values.length
    };
}
