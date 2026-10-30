const FAMILY_TREE = {
    Ada: ["Bram", "Cora", "Dax"],
    Bram: ["Eli", "Faye"],
    Cora: ["Gus", "Hana"],
    Dax: ["Ivo", "Juno"],
    Eli: ["Kira", "Liam"],
    Faye: ["Mona", "Niko"],
    Gus: ["Omar", "Pia"],
    Hana: ["Quin", "Ravi"]
};
const PERSON_A = "Bram";
const PERSON_B = "Liam";

export function execute(solutionModule) {
    const { degreesOfSeparation } = solutionModule;

    if (typeof degreesOfSeparation !== "function") {
        throw new Error("A função degreesOfSeparation não foi encontrada.");
    }

    return degreesOfSeparation(FAMILY_TREE, PERSON_A, PERSON_B);
}
