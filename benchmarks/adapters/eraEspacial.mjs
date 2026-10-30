const SECONDS = 1_000_000_000;
const PLANETS = [
    "Mercury", "Venus", "Earth", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune"
];

export function execute(solutionModule) {
    const { age } = solutionModule;

    if (typeof age !== "function") {
        throw new Error("A função age não foi encontrada.");
    }

    const ages = PLANETS.map(planet => age(planet, SECONDS));
    return Number(ages.reduce((total, years) => total + years, 0).toFixed(2));
}
