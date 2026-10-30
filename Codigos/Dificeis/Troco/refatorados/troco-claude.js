/**
 * Calculates the combination of coins with the fewest coins
 * that adds up to a given amount of change.
 */
export class Change {
  constructor() {
    this.target = undefined;
    this.changeVariations = [];
  }

  /**
   * Returns the combination of coins with the fewest coins whose
   * sum equals the target amount.
   *
   * @param {number[]} coinArray Available coin values.
   * @param {number} target Amount of change to be given.
   * @returns {number[]} The coins, sorted in ascending order.
   */
  calculate(coinArray, target) {
    if (target < 0) {
      throw new Error('Negative totals are not allowed.');
    }

    if (target === 0) {
      return [];
    }

    this.target = target;

    // Coins larger than the target cannot be used, so they are discarded.
    // The remaining coins are sorted in descending order.
    const coins = coinArray
      .filter(coin => coin <= target)
      .sort((a, b) => b - a);

    // Try the fast greedy approach first. Fall back to the exhaustive
    // search only when the greedy approach finds no combination.
    this.getChangeSimple(coins);

    if (this.changeVariations.length === 0) {
      this.getChangeExhaustive(coins);
    }

    return this.getChangeWithFewestCoins();
  }

  /**
   * Returns the stored variation with the fewest coins.
   *
   * @returns {number[]} The coins, sorted in ascending order.
   * @throws {Error} If no variation has been found.
   */
  getChangeWithFewestCoins() {
    if (this.changeVariations.length === 0) {
      throw new Error(`The total ${this.target} cannot be represented in the given currency.`);
    }

    this.changeVariations.sort((a, b) => a.length - b.length);

    return this.changeVariations[0];
  }

  /**
   * Stores a change variation, ignoring it if an identical one
   * (same coins, any order) is already stored.
   *
   * @param {number[]} change The coins of the variation.
   */
  addChangeVariation(change) {
    const sorted = [...change].sort((a, b) => a - b);
    const key = JSON.stringify(sorted);

    const alreadyStored = this.changeVariations.some(
      variation => JSON.stringify(variation) === key
    );

    if (!alreadyStored) {
      this.changeVariations.push(sorted);
    }
  }

  /**
   * Fast greedy approach. For each starting position in the coin list,
   * takes as many coins as possible in order, from that position onward.
   * It does not find a solution when the coin list has no unit coin.
   *
   * @param {number[]} coins Available coin values, in descending order.
   */
  getChangeSimple(coins) {
    coins.forEach((_, start) => {
      const change = this.buildGreedyChange(coins.slice(start));

      if (change) {
        this.addChangeVariation(change);
      }
    });
  }

  /**
   * Builds a change using the coins in the given order, taking
   * as many of each coin as possible.
   *
   * @param {number[]} coins Coin values, in the order to be used.
   * @returns {number[]|null} The coins if they sum to the target, otherwise null.
   */
  buildGreedyChange(coins) {
    let remaining = this.target;
    let change = [];

    for (const coin of coins) {
      const quantity = Math.floor(remaining / coin);
      remaining -= quantity * coin;
      change = change.concat(Array(quantity).fill(coin));
    }

    return remaining === 0 ? change : null;
  }

  /**
   * Exhaustive approach. Explores every combination of coins that
   * sums to the target. It is slow for large targets, so it is used
   * only when the greedy approach finds nothing.
   *
   * @param {number[]} coins Available coin values, in descending order.
   * @param {number} remaining Amount still to be covered.
   * @param {number[]} path Coins chosen so far.
   */
  getChangeExhaustive(coins, remaining = this.target, path = []) {
    for (const coin of coins) {
      const rest = remaining - coin;

      if (rest > 0) {
        const usableCoins = coins.filter(c => c <= rest);
        this.getChangeExhaustive(usableCoins, rest, [...path, coin]);
      } else if (rest === 0) {
        this.addChangeVariation([...path, coin]);
      }
    }
  }
}