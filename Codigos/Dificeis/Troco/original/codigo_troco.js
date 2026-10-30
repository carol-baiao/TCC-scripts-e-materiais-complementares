export class Change {
  /**
   * Constructor for initiating the object properties.
   */
  constructor() {
    this.target = undefined;
    this.changeVariations = [];
  };

  /**
   * Correctly determines the fewest number of coins to be
   * given to a customer such that the sum of the coins'
   * value would equal the correct amount of change.
   * 
   * @param {Integer[]} coinArray The coins to be used for the change. 
   * @param {Integer} target The target value to be given. 
   */
  calculate(coinArray, target) {

    // Raise an error if invalid target value is provided.
    if (target < 0) {
      throw new Error('Negative totals are not allowed.');
    }

    // Stop immediatly with empty result if no target provided.
    if (target === 0) {
      return [];
    }

    // Store target in object's properties.
    this.target = target;

    // Remove coins which value is larger than the 
    // target and sort the coins in descending order.
    coinArray = coinArray
      .filter(c => c <= this.target)
      .sort((a,b) => b-a);

    // Try first find the change variations with
    // a simple and fast algorithm. 
    this.getChangeSimple(coinArray, this.initCounts(coinArray));

    // If the simple and fast approach didn't provide
    // any matches, try again with exhaustive algorithm.
    if (this.changeVariations.length === 0) {
      this.getChangeExhaustive(coinArray, this.initCounts(coinArray));
    }

    // Return the result (or error).
    return this.getChangeWithFewestCoins();
  };

  /**
   * Initiates the count object used for
   * calculating the change variations.
   * 
   * @param {Integer[]} coinArray The array of available coin values. 
   * @returns {Object} The count object in format:
   * {'coinValue#1': 0, 'coinValue#2': 1, ... , 'coinValue#N': 0, 'target': target}
   */
  initCounts(coinArray) {
    let counts = {};
    for (let i = 0; i < coinArray.length; i++) {
      counts[coinArray[i]] = 0;
    }
    counts['target'] = this.target;

    return {...counts};
  }

  /**
   * Finds the change variations containing fewest amount of coins
   * from object's changeVariations array and returns it. If the
   * changeVariation array is empty, returns an error.
   * 
   * @returns {Integer[]} 
   */
  getChangeWithFewestCoins() {

    if (this.changeVariations.length === 0) {
      throw new Error(`The total ${this.target} cannot be represented in the given currency.`);
    }
    
    this.changeVariations.sort((a, b) => {
      return a.length - b.length;
    });

    return this.changeVariations[0].sort((a,b) => a - b);
  };

  /**
   * Parses the coin amounts from the given counts object and
   * adds a new change variation in the object's changeVariations
   * array.
   * 
   * @param {Object} counts 
   */
  addChangeVariation(counts) {

    let change = [];

    for (const [key, value] of Object.entries(counts)) {
      for (let i = 0; i < value; i++) {
        change.push(parseInt(key));
      }
    }

    const found = this.changeVariations.find(c => {
      if (JSON.stringify(c) === JSON.stringify(change)) {
        return c;
      }
    });
    
    if (!found) {
      this.changeVariations.push(change);
    }
  };

  /**
   * A simple and fast algorithm/approach for getting
   * possible target change variations with the given
   * coin values. To be noted that this approach does
   * not provide successful result if the the coinArray
   * does not contain unit coin.  
   * 
   * @param {Integer[]} coinArray The available coin values.
   * @param {Object} counts The counts of identified change coins.
   */
  getChangeSimple(coinArray, counts) {
    
    for (let i = 0; i < Object.keys(counts).length - 1; i++) {
      counts[coinArray[i]] = Math.floor(counts['target'] / coinArray[i]);
      counts['target'] -= counts[coinArray[i]] * coinArray[i];
    }

    if (counts['target'] === 0) {
      this.addChangeVariation(counts);
    }
    
    if (coinArray.length > 0) {
      const modCoinArray = coinArray.filter((c, index) => {
        if (index !== 0) {
          return c;
        }
      });

      this.getChangeSimple(modCoinArray, this.initCounts(modCoinArray));
    }
  };

  /**
   * An exhaustive algorithm/approach for getting all
   * possible change variations with the provided coin
   * values. To be used only if the simple approach does
   * not provide desired result. In many cases this approach
   * is too heavy/time consuming for getting the result.
   * 
   * @param {Integer[]} coinArray The available coin values.
   * @param {Object} counts The counts of identified change coins. 
   */
  getChangeExhaustive(coinArray, counts) {
    
    // Walk through all suitable coins, substract the value
    // of the coin from the target and continue until the
    // target is reached. 
    for (let i = 0; i < coinArray.length; i++) {

      // Target not reached yet -> continue the process.
      if (counts['target'] - coinArray[i] > 0) {
        let newCounts = {...counts};
        newCounts[coinArray[i]] += 1;
        newCounts['target'] -= coinArray[i];

        // Remove coins not suitable anymore.
        const possibleCoins = coinArray.filter(c => c <= newCounts['target']);

        // Find recursively next suitable coins.
        this.getChangeExhaustive(possibleCoins, newCounts);
      }

      // Target reached -> store the found change variation.
      if (counts['target'] - coinArray[i] === 0) {
        let newCounts = {...counts};
        newCounts[coinArray[i]] += 1;
        newCounts['target'] -= coinArray[i];

        this.addChangeVariation(newCounts);
      }
    }
  };
};