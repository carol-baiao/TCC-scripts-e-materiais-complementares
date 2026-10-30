const PROGRAM = ": square dup * ; 7 square 3 + 4 *";

export function execute(solutionModule) {
    const { Forth } = solutionModule;

    if (typeof Forth !== "function") {
        throw new Error("A classe Forth não foi encontrada.");
    }

    const interpreter = new Forth();
    interpreter.evaluate(PROGRAM);

    return interpreter.stack.at(-1);
}
