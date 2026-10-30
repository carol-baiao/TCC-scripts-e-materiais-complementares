const INPUT = 27;

export function execute(solutionModule) {
    // A versão imperativa evita o cache global que é preenchido durante o aquecimento
    // nas outras implementações exportadas pelo código original.
    const steps = solutionModule.stepsImperative;

    if (typeof steps !== "function") {
        throw new Error("A função stepsImperative não foi encontrada.");
    }

    return steps(INPUT);
}
