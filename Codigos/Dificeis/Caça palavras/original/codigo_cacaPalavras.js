/**
* A class definition for WordSearch objects.
*/ 
class WordSearch {
  /**
  * Constructor for initiating a new WordSearch object.
  * 
  * @param
  */
  constructor(puzzleGrid) {
    this.grid = puzzleGrid;
  }

  find(wordsToBeSearched) {
    
    // Init result object.
    let findingsObj = {};

    // Loop through each given word.
    wordsToBeSearched.forEach(word => {

      let exitWhile = false;
      let rowIndex = 0;
      
      // Loop through all rows from the grid until the word is found (or rows run out).
      while (!exitWhile) {
      
        // Get all possible start indexes of the searched word from the row.
        const startIndexes = this.#getAllStartIndexesFromRow(rowIndex, word[0]);

        // If start indexes found, take a word-length samples from all possible directions.
        // Then confirm is any of the samples equal with the word to be searched.
        if (startIndexes.length > 0) {

          let matchDetails = null;

          // Loop through all found start indexes. If the searched word
          // is found abort the search, break out from this for-loop and
          // continue from the next given word to be searched. 
          for (let i = 0; i < startIndexes.length; i++) {

            matchDetails = this.#matchLeftToRight({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            matchDetails = this.#matchRightToLeft({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            matchDetails = this.#matchTopToBottom({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            matchDetails = this.#matchBottomToTop({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            matchDetails = this.#matchTopLeftToBottomRight({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            matchDetails = this.#matchBottomRightToTopLeft({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            matchDetails = this.#matchBottomLeftToTopRight({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            matchDetails = this.#matchTopRightToBottomLeft({
              start: {
                row: rowIndex,
                col: startIndexes[i],
              },
              word: word
            });

            if (matchDetails) {
              findingsObj[word] = matchDetails;
              exitWhile = true;
              break;
            }

            // Searched word not found from the puzzle grid.
            findingsObj[word] = undefined;
          }
        }

        // Increase grid row index if there are still rows available.
        // Otherwise, update while-loop condition in order to break out.
        if (rowIndex < this.grid.length - 1) {
          rowIndex += 1;
        
        } else {
          exitWhile = true;
        }
      }
    });

    return findingsObj;
  };

  /**
  * A private auxiliary method for returning all found start
  * indexes of the word to be searched from the current row.
  * 
  * @param {Integer} r The row to be processed.
  * @param {String} c The first character of the word to be searched.
  * @return {integer[]}
  */
  #getAllStartIndexesFromRow(r, c) {
    
    let startIndexes = [];

    for (let i = 0; i < this.grid[r].length; i++) {
      if (this.grid[r][i] === c) startIndexes.push(i);
    }

    return startIndexes;
  }

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from LEFT TO RIGHT. If the word
  * is found, its start-end coordinates are returned. Othewise, the
  * return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchLeftToRight({start, word}) {

    const sample = this.grid[start.row].substr(start.col, word.length);

    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [start.row + 1, start.col + word.length],
      };

    } else {
      return null;
    }
  };

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from RIGHT TO LEFT. If the word
  * is found, its start-end coordinates are returned. Othewise, the
  * return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchRightToLeft({start, word}) {

    let sample = this.grid[start.row].substr((start.col - (word.length - 1)), word.length);
    sample = sample.split('').reverse().join('');

    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [start.row + 1, (start.col - (word.length - 1)) + 1],
      };

    } else {
      return null;
    }
  };

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from TOP TO BOTTOM. If the word
  * is found, its start-end coordinates are returned. Othewise, the
  * return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchTopToBottom({start, word}) {

    let sample = '';
    
    let exitWhile = false;
    let counter = start.row;
    
    while (!exitWhile) {

      sample += this.grid[counter][start.col];

      if (counter === (start.row - (word.length - 1)) || counter === this.grid.length - 1) {
        exitWhile = true;

      } else {
        counter += 1;
      }
    }


    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [(start.row + (word.length - 1)) + 1, start.col + 1],
      };

    } else {
      return null
    }
  };

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from BOTTOM TO TOP. If the word
  * is found, its start-end coordinates are returned. Othewise, the
  * return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchBottomToTop({start, word}) {

    let sample = '';
    
    let exitWhile = false;
    let counter = start.row;

    while (!exitWhile) {

      sample += this.grid[counter][start.col];

      if (counter === (start.row - (word.length - 1)) || counter === 0) {
        exitWhile = true;

      } else {
        counter -= 1;
      }
    }

    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [(start.row - (word.length - 1)) + 1, start.col + 1],
      };

    } else {
      return null
    }
  };

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from TOP-LEFT TO BOTTOM-RIGHT.
  * If the word is found, its start-end coordinates are returned.
  * Othewise, the return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchTopLeftToBottomRight({start, word}) {

    let sample = '';
    
    let exitWhile = false;
    let rowCounter = start.row;
    let colCounter = start.col;
    
    while (!exitWhile) {

      sample += this.grid[rowCounter][colCounter];

      if (
        rowCounter === (start.row + (word.length - 1)) || rowCounter === this.grid.length - 1 ||
        colCounter === (start.col + (word.length - 1)) || colCounter === this.grid[rowCounter].length - 1
      ) {
        exitWhile = true;

      } else {
        rowCounter += 1;
        colCounter += 1;
      }
    }
    
    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [(start.row + (word.length - 1)) + 1, colCounter + 1],
      };

    } else {
      return null
    }
  };

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from BOTTOM-RIGHT TO TOP-LEFT.
  * If the word is found, its start-end coordinates are returned.
  * Othewise, the return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchBottomRightToTopLeft({start, word}) {

    let sample = '';
    
    let exitWhile = false;
    let rowCounter = start.row;
    let colCounter = start.col;

    while (!exitWhile) {

      sample += this.grid[rowCounter][colCounter];

      if (
        rowCounter === (start.row - (word.length - 1)) || rowCounter === 0 ||
        colCounter === (start.col - (word.length - 1)) || colCounter === 0
      ) {
        exitWhile = true;

      } else {
        rowCounter -= 1;
        colCounter -= 1;
      }
    }
    
    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [rowCounter + 1, colCounter + 1],
      };

    } else {
      return null
    }
  };

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from BOTTOM-LEFT TO TOP-RIGHT.
  * If the word is found, its start-end coordinates are returned.
  * Othewise, the return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchBottomLeftToTopRight({start, word}) {

    let sample = '';
    
    let exitWhile = false;
    let rowCounter = start.row;
    let colCounter = start.col;
    
    while (!exitWhile) {
      
      sample += this.grid[rowCounter][colCounter];

      if (
        rowCounter === (start.row - (word.length - 1)) || rowCounter === 0 ||
        colCounter === (start.col + (word.length - 1)) || colCounter === this.grid[rowCounter].length - 1
      ) {
        exitWhile = true;

      } else {
        rowCounter -= 1;
        colCounter += 1;
      }
    }
    
    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [rowCounter + 1, colCounter + 1],
      };

    } else {
      return null
    }
  };

  /**
  * A private auxiliary method that searches for a given word from
  * a given starting point by going from TOP-RIGHT TO BOTTOM-LEFT.
  * If the word is found, its start-end coordinates are returned.
  * Othewise, the return value is 'null'.
  * 
  * @param {Object} start The object containing row-col values of the starting point.
  * @param {String} word The word to be searched
  * @return {Object | null} 
  */
   #matchTopRightToBottomLeft({start, word}) {

    let sample = '';
    
    let exitWhile = false;
    let rowCounter = start.row;
    let colCounter = start.col;

    while (!exitWhile) {
      
      sample += this.grid[rowCounter][colCounter];
      
      if (
        rowCounter === (start.row + (word.length - 1)) || rowCounter === this.grid.length - 1 ||
        colCounter === (start.col - (word.length - 1)) || colCounter === 0
      ) {
        exitWhile = true;

      } else {
        rowCounter += 1;
        colCounter -= 1;
      }
    }
    
    if (sample === word) {

      return {
        start: [start.row + 1, start.col + 1],
        end: [rowCounter + 1, colCounter + 1],
      };

    } else {
      return null
    }
  };
};

export default WordSearch;