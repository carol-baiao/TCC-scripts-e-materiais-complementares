
export class Change {
  constructor() {
    this.target = undefined;
    this.changeVariations = [];
  }

  /**
   * Calculates the change using the fewest possible coins.
   *
   * @param {number[]} coinArray Available coin values.
   * @param {number} target Target change amount.
   * @returns {number[]} Coins that represent the target amount.
   * @throws {Error} If the target is negative or cannot be represented.
   */
  calculate(coinArray, target) {
    if (target < 0) {
      throw new Error('Negative totals are not allowed.');
    }

    if (target === 0) {
      return [];
    }

    this.target = target;
    this.changeVariations = [];

    const availableCoins = coinArray
      .filter((coin) => coin <= target)
      .sort((a, b) => b - a);

    this.getChangeSimple(
      availableCoins,
      this.initCounts(availableCoins)
    );

    if (this.changeVariations.length === 0) {
      this.getChangeExhaustive(
        availableCoins,
        this.initCounts(availableCoins)
      );
    }

    return this.getChangeWithFewestCoins();
  }

  /**
   * Initializes the coin counts for a given set of coins.
   *
   * @param {number[]} coinArray Available coin values.
   * @returns {Object} Coin counts and the remaining target.
   */
  initCounts(coinArray) {
    const counts = {};

    for (const coin of coinArray) {
      counts[coin] = 0;
    }

    counts.target = this.target;

    return { ...counts };
  }

  /**
   * Returns the valid change variation with the fewest coins.
   *
   * @returns {number[]} Sorted change variation.
   * @throws {Error} If no valid variation exists.
   */
  getChangeWithFewestCoins() {
    if (this.changeVariations.length === 0) {
      throw new Error(
        `The total ${this.target} cannot be represented in the given currency.`
      );
    }

    this.changeVariations.sort(
      (first, second) => first.length - second.length
    );

    return this.changeVariations[0].sort((a, b) => a - b);
  }

  /**
   * Adds a unique change variation to the collection.
   *
   * @param {Object} counts Coin counts and the remaining target.
   */
  addChangeVariation(counts) {
    const change = [];

    for (const [coin, count] of Object.entries(counts)) {
      if (coin === 'target') {
        continue;
      }

      for (let i = 0; i < count; i++) {
        change.push(Number.parseInt(coin, 10));
      }
    }

    const variationAlreadyExists = this.changeVariations.some(
      (variation) =>
        JSON.stringify(variation) === JSON.stringify(change)
    );

    if (!variationAlreadyExists) {
      this.changeVariations.push(change);
    }
  }

  /**
   * Attempts to find change variations using a greedy approach.
   * This approach may fail when the available denominations
   * do not allow the greedy strategy to reach the target.
   *
   * @param {number[]} coinArray Available coin values.
   * @param {Object} counts Current coin counts and remaining target.
   */
  getChangeSimple(coinArray, counts) {
    for (let i = 0; i < coinArray.length; i++) {
      const coin = coinArray[i];
      const coinCount = Math.floor(counts.target / coin);

      counts[coin] = coinCount;
      counts.target -= coinCount * coin;
    }

    if (counts.target === 0) {
      this.addChangeVariation(counts);
    }

    const remainingCoins = coinArray.slice(1);

    if (remainingCoins.length > 0) {
      this.getChangeSimple(
        remainingCoins,
        this.initCounts(remainingCoins)
      );
    }
  }

  /**
   * Searches recursively for all valid change variations.
   *
   * @param {number[]} coinArray Available coin values.
   * @param {Object} counts Current coin counts and remaining target.
   */
  getChangeExhaustive(coinArray, counts) {
    for (let i = 0; i < coinArray.length; i++) {
      const coin = coinArray[i];
      const remainingTarget = counts.target - coin;

      if (remainingTarget < 0) {
        continue;
      }

      const updatedCounts = { ...counts };
      updatedCounts[coin] += 1;
      updatedCounts.target = remainingTarget;

      if (remainingTarget === 0) {
        this.addChangeVariation(updatedCounts);
        continue;
      }

      const possibleCoins = coinArray.filter(
        (availableCoin) => availableCoin <= remainingTarget
      );

      this.getChangeExhaustive(possibleCoins, updatedCounts);
    }
  }
}
