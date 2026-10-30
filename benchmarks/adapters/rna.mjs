const DNA = "ACGTGCAATGCCGTTA".repeat(4);

export function execute(solutionModule) {
    const { toRna } = solutionModule;

    if (typeof toRna !== "function") {
        throw new Error("A função toRna não foi encontrada.");
    }

    // Retorna o comprimento para manter o resultado do benchmark pequeno,
    // mas a conversão completa da sequência é executada.
    return toRna(DNA).length;
}
