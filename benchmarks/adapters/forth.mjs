const REPETITIONS = 32;
const PROGRAM = `: square dup * ; ${"7 square drop ".repeat(REPETITIONS)}7 square 3 + 4 *`;

export function execute(solutionModule) {
    const { Forth } = solutionModule;
    if (typeof Forth !== "function") {
        throw new Error("A classe Forth não foi encontrada.");
    }

    const interpreter = new Forth();
    interpreter.evaluate(PROGRAM);

    // Compatível com as implementações que expõem a pilha publicamente.
    const stack = interpreter.stack ?? interpreter._stack;
    return Array.isArray(stack) ? stack[stack.length - 1] : interpreter;
}
