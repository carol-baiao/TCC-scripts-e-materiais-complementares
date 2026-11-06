const PLAINTEXT = (
    "If man was meant to stay on the ground, god would have given us roots. "
).repeat(4);

export function execute(solutionModule) {
    const { Crypto } = solutionModule;
    if (typeof Crypto !== "function") {
        throw new Error("A classe Crypto não foi encontrada.");
    }

    const crypto = new Crypto(PLAINTEXT);
    return crypto.ciphertext.length;
}
