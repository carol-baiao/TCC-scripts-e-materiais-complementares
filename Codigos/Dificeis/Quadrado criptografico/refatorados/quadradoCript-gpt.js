
/**
 * Encodes a message using the classic square-code method.
 */
export class Crypto {
  /**
   * Initializes the message and generates its ciphertext.
   * @param {string} str - The plaintext to encode.
   */
  constructor(str) {
    this._plaintext = str;
    this._normalizedtext = '';
    this._squaretext = [];
    this._ciphertext = '';
    this._c = 0;
    this._r = 0;

    this.normalize();
    this.forkColAndRowLengths();
    this.square();
    this.cipher();
  }

  /**
   * Returns the encoded message.
   */
  get ciphertext() {
    return this._ciphertext;
  }

  /**
   * Converts the plaintext to lowercase and removes
   * whitespace and non-word characters.
   */
  normalize() {
    this._normalizedtext = this._plaintext
      .toLowerCase()
      .replace(/^\s+|\s+$/g, '')
      .replace(/[^\w]/g, '');
  }

  /**
   * Arranges the normalized text into rows and pads
   * the final row with spaces when necessary.
   */
  square() {
    let row = '';
    const textLength = this._normalizedtext.length;

    for (let index = 1; index <= textLength; index++) {
      row += this._normalizedtext[index - 1];

      const isRowFull = index % this._c === 0;
      const isLastCharacter = index === textLength;

      if (isRowFull || isLastCharacter) {
        if (row.length < this._c) {
          row += ' '.repeat(this._c - row.length);
        }

        this._squaretext.push(row);
        row = '';
      }
    }
  }

  /**
   * Generates the ciphertext by reading the square
   * column by column.
   */
  cipher() {
    for (let column = 1; column <= this._c; column++) {
      for (let row = 1; row <= this._r; row++) {
        this._ciphertext +=
          this._squaretext[row - 1][column - 1];

        const isEndOfColumn = row % this._r === 0;
        const hasMoreColumns = column < this._c;

        if (this._r > 1 && isEndOfColumn && hasMoreColumns) {
          this._ciphertext += ' ';
        }
      }
    }
  }

  /**
   * Calculates the number of columns and rows
   * required to organize the normalized text.
   */
  forkColAndRowLengths() {
    const textLength = this._normalizedtext.length;

    for (let columns = 1; columns <= textLength; columns++) {
      for (let rows = 1; rows <= textLength; rows++) {
        const fitsText = columns * rows >= textLength;
        const columnsAtLeastRows = columns >= rows;
        const dimensionsAreClose = columns - rows <= 1;

        if (fitsText && columnsAtLeastRows && dimensionsAreClose) {
          this._c = columns;
          this._r = rows;
          return;
        }
      }
    }
  }
}
