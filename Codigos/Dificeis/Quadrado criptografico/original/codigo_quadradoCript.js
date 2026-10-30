/**
 * A class definition for Crypto object handling
 * composing of a secret messages utilizing the
 * classic 'square code' method.
 */
export class Crypto {
  /**
   * Initiates the object by setting the properties
   * used in the process.
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
  };

  /**
   * Returns the encoded text.
   */
  get ciphertext() {
    return this._ciphertext;
  };

  /**
   * Normalizes given plain text by converting
   * it to lower case and removing all white-spaces
   * and punctuations.
   */
  normalize() {
    this._normalizedtext = this._plaintext
      .toLowerCase()
      .replace(/^\s+|\s+$/g, '')
      .replace(/[^\w]/g, '');
  };

  /**
   * Converts the normalized text in rectangle format. 
   */
  square() {
    let row = '';
    for (let i = 1; i <= this._normalizedtext.length; i++) {
      
      row += this._normalizedtext[i - 1];

      // WHEN row is full
      // OR the current row is the last one
      // THEN push the row in the square text array. 
      if (i % this._c === 0 || i === this._normalizedtext.length) {
        
        // WHEN row is not full
        // THEN add trailing white-spaces until it is full.
        if (row.length < this._c) {
          row += ' '.repeat(this._c - row.length);
        }
        
        this._squaretext.push(row);
        row = '';
      }
    } 
  };

  /**
   * Composes square code ciphered message
   * using the square text array and the defined
   * row and column lengths.
   */
  cipher() {

    for (let c = 1; c <= this._c; c++) {

      for (let r = 1; r <= this._r; r++) {

        this._ciphertext += this._squaretext[r - 1][c - 1];
        
        // WHEN square text contains more than one chunk
        // AND we are at the of chunk
        // AND the current chunk is not the last one
        // THEN add white-space separator between chunks. 
        if (this._r > 1 && r % this._r === 0 && c < this._c) {
          this._ciphertext += ' ';
        }
      }       
    }
  };

  /**
   * Forks and sets the length values for
   * square rows and columns.
   */
  forkColAndRowLengths() {
    
    const l = this._normalizedtext.length;
    let breakOuter = false;
    
    for (let c = 1; c <= l; c++) {

      for (let r = 1; r <= l; r++) {

        if (c * r >= l && c >= r && c - r <= 1) {
          this._c = c;
          this._r = r;
          breakOuter = true;
          break;
        }
      }

      if (breakOuter) {
        break;
      }
    }
  }
}