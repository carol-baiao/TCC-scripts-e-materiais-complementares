export class Change {
  /**
   * Constructor for initiating the object properties.
   */
  constructor() {
    this.target = undefined;
    this.changeVariations = [];
  }

  /**
   * Correctly determines the fewest number of coins to be
   * given to a customer such that the sum of the coins'
   * value would equal the correct amount of change.
   *
   * @param {Integer[]} coinArray The coins to be used for the change.
   * @param {Integer} target The target value to be given.
   * @returns {Integer[]} The change with the fewest coins.
   */
  calculate(coinArray, target) {
    if (target < 0) {
      throw new Error('Negative totals are not allowed.');
    }

    if (target === 0) {
      return [];
    }

    this.target = target;

    // Only coins up to the target are useful, and processing
    // them in descending order favors the fast approach.
    const usableCoins = coinArray
      .filter((coin) => coin <= this.target)
      .sort((a, b) => b - a);

    this.getChangeSimple(usableCoins, this.initCounts(usableCoins));

    // The simple approach only succeeds when a unit coin exists;
    // fall back to the exhaustive search otherwise.
    if (this.changeVariations.length === 0) {
      this.getChangeExhaustive(usableCoins, this.initCounts(usableCoins));
    }

    return this.getChangeWithFewestCoins();
  }

  /**
   * Initiates the count object used for calculating the change variations.
   *
   * @param {Integer[]} coinArray The array of available coin values.
   * @returns {Object} The count object in format:
   * {'coinValue#1': 0, 'coinValue#2': 1, ... , 'coinValue#N': 0, 'target': target}
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
   * Finds the change variation containing the fewest amount of coins
   * from the object's changeVariations array and returns it. If the
   * changeVariations array is empty, returns an error.
   *
   * @returns {Integer[]}
   */
  getChangeWithFewestCoins() {
    if (this.changeVariations.length === 0) {
      throw new Error(
        `The total ${this.target} cannot be represented in the given currency.`
      );
    }

    const sortedByLength = [...this.changeVariations].sort(
      (a, b) => a.length - b.length
    );

    return sortedByLength[0].sort((a, b) => a - b);
  }

  /**
   * Parses the coin amounts from the given counts object and
   * adds a new change variation in the object's changeVariations
   * array (avoiding duplicates).
   *
   * @param {Object} counts
   */
  addChangeVariation(counts) {
    const change = [];

    for (const [key, value] of Object.entries(counts)) {
      for (let i = 0; i < value; i++) {
        change.push(parseInt(key));
      }
    }

    const isDuplicate = this.changeVariations.some(
      (variation) => JSON.stringify(variation) === JSON.stringify(change)
    );

    if (!isDuplicate) {
      this.changeVariations.push(change);
    }
  }

  /**
   * A simple and fast algorithm/approach for getting possible target
   * change variations with the given coin values. Note that this
   * approach does not provide a successful result if the coinArray
   * does not contain a unit coin.
   *
   * @param {Integer[]} coinArray The available coin values.
   * @param {Object} counts The counts of identified change coins.
   */
  getChangeSimple(coinArray, counts) {
    for (let i = 0; i < coinArray.length; i++) {
      counts[coinArray[i]] = Math.floor(counts.target / coinArray[i]);
      counts.target -= counts[coinArray[i]] * coinArray[i];
    }

    if (counts.target === 0) {
      this.addChangeVariation(counts);
    }

    if (coinArray.length > 0) {
      const remainingCoins = coinArray.filter((_, index) => index !== 0);

      this.getChangeSimple(remainingCoins, this.initCounts(remainingCoins));
    }
  }

  /**
   * An exhaustive algorithm/approach for getting all possible change
   * variations with the provided coin values. To be used only if the
   * simple approach does not provide the desired result. In many cases
   * this approach is too heavy/time consuming for getting the result.
   *
   * @param {Integer[]} coinArray The available coin values.
   * @param {Object} counts The counts of identified change coins.
   */
  getChangeExhaustive(coinArray, counts) {
    for (const coin of coinArray) {
      const remainingTarget = counts.target - coin;

      // Target not reached yet -> continue the process.
      if (remainingTarget > 0) {
        const newCounts = { ...counts };
        newCounts[coin] += 1;
        newCounts.target = remainingTarget;

        const possibleCoins = coinArray.filter((c) => c <= remainingTarget);

        this.getChangeExhaustive(possibleCoins, newCounts);
      }

      // Target reached -> store the found change variation.
      if (remainingTarget === 0) {
        const newCounts = { ...counts };
        newCounts[coin] += 1;
        newCounts.target = remainingTarget;

        this.addChangeVariation(newCounts);
      }
    }
  }
}