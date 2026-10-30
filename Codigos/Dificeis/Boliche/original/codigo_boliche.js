/**
 * Class definition for bowling frame objects containing
 * frame id, the result of first and the second roll and
 * the score of the frame.
 */
class Frame {
  /**
   * Constructor for iniating the frame object.
   * 
   * @param {Integer} id The id of the frame (1-10).
   */
  constructor(id) {
    this.id = id;
    this.firstRoll = null;
    this.secondRoll = null;
    this.score = null;
  };
};

/**
 * Class definition for the last (10th) bowling frame objects.
 * Extends the Frame object and adding a new property for
 * the third roll.
 */
class LastFrame extends Frame {
  /**
   * Constructor for initiating the last frame object.
   */
  constructor() {
    super(10);
    this.thirdRoll = null;
  }
};

/**
 * Class definition for the bowling series objects containing
 * the id of the series and the frame array. Including also
 * basic operations for manipulating the series data based on
 * the made bowling rolls.
 */
class Bowlingseries {
  constructor(id) {
    this.id = id;
    this.frames = [];

    this.initFrames();
  }

  /**
   * Method for initiating the frame array with
   * frame objects with default empty values.
   */
  initFrames() {
    for (let i = 1; i <= 9; i++) {
      this.frames.push(new Frame(i));
    }
    this.frames.push(new LastFrame());
  }

  /**
   * Method for getting the next frame to be uodated
   * when the new roll is made.
   * 
   * @returns {Frame} The next frame to be updated.
   */
  getNextFrame() {
    // Get the next frame to be updated.
    const frame = this.frames.find(frame => {

      // Frame #10, third roll
      if (frame.firstRoll !== null && frame.secondRoll !== null && frame.thirdRoll === null && frame.score === null) {
        return frame;

      // Frame #10, second roll
      } else      
        if (frame.firstRoll !== null && frame.secondRoll === null && frame.thirdRoll === null) {
          return frame;
      
      // Next frame before tenth frame where the second roll is not set.
      } else if (frame.firstRoll <= 9 && frame.secondRoll === null) {
        return frame;

      // Next frame before tenth where the first roll is not set.
      } else if (frame.firstRoll === null) {
        return frame;
      }
    });

    return frame;
  };

  /**
   * Method for setting the result of the bowling roll based
   * on the given value.
   * 
   * @param {Integer} pins The result of the bowling roll. 
   */
  setRoll(pins) {
    
    // Raise an error if the result within the valid range (0-10).
    if (pins < 0) {
      throw new Error('Negative roll is invalid');

    } else if (pins > 10) {
      throw new Error('Pin count exceeds pins on the lane');
    }

    const nextFrame = this.getNextFrame();

    // Raise an error if trying to add a new roll result when
    // there isn't any frames to be played.
    if (!nextFrame) {
      throw new Error('Cannot roll after game is over');
    }

    // Setting the result of the roll.
    if (nextFrame.firstRoll === null) {

      if (pins === 10) {
        nextFrame.firstRoll = 'X'; // Strike

      } else {
        nextFrame.firstRoll = pins;
      }
      
    } else if (nextFrame.secondRoll === null) {

      if (pins === 10) {
        nextFrame.secondRoll = 'X'; // 10th frame and strike

      } else if (nextFrame.firstRoll + pins === 10) {
        nextFrame.secondRoll = '/'; // Spare

      } else {

        if (nextFrame.firstRoll + pins > 10) {
          throw new Error('Pin count exceeds pins on the lane');
        }
        
        nextFrame.secondRoll = pins;
      }

    } else if (nextFrame.thirdRoll === null) {

      if (pins === 10) {

        if (!isNaN(nextFrame.secondRoll)) {
          throw new Error('Pin count exceeds pins on the lane');
        }

        nextFrame.thirdRoll = 'X';

      } else if (nextFrame.secondRoll + pins === 10) {

        nextFrame.thirdRoll = '/';

      } else {
        if (nextFrame.secondRoll + pins > 10) {
          throw new Error('Pin count exceeds pins on the lane');

        } else {
          nextFrame.thirdRoll = pins;
        }
      }
    }

    this.calculateFrameScore(nextFrame.id);
  };

  /**
   * Method for calculating the score of the frame.
   * 
   * @param {Integer} frameId The id of the frame to be calculated. 
   */
  calculateFrameScore(frameId) {
    const curFrame = this.frames.find(frame => frame.id === frameId);
    const prevFrame = this.frames.find(frame => frame.id === (frameId - 1));
    const prevPrevFrame = this.frames.find(frame => frame.id === (frameId - 2));
  
    // Processing frames from 1 to 9.
    if (curFrame.id < 10) {
      
      // The current frame is not STRIKE nor SPARE.
      if (curFrame.firstRoll !== 'X' && curFrame.secondRoll !== '/') {

        curFrame.score = curFrame.firstRoll + curFrame.secondRoll;
              
        // Update the score of the previous frame if it was a SPARE.
        if (prevFrame && prevFrame.secondRoll === '/') {
          prevFrame.score = 10 + curFrame.firstRoll;
        
        // Update the score of the previous frame if it was a STRIKE.
        } else if (prevFrame && prevFrame.firstRoll === 'X') {
          prevFrame.score = 10 + curFrame.score;

          // Update also the score of the previous-previous frame if it was a STRIKE.
          if (prevPrevFrame && prevPrevFrame.firstRoll === 'X') {
            prevPrevFrame.score = 20 + curFrame.firstRoll;
          }
        }

      // The current frame is SPARE
      } else if (curFrame.secondRoll === '/') {

        // Note: the score of the current frame is not updated
        // in the case of SPARE because it requires the next roll
        // that is not done yet -> score of this frame is updated
        // after the next roll.

        // Update the score of the previous frame if it was a SPARE.
        if (prevFrame && prevFrame.secondRoll === '/') {
          prevFrame.score = 10 + curFrame.firstRoll;
        
        // Update the score of the previous frame if it was a STRIKE
        } else if (prevFrame && prevFrame.firstRoll === 'X') {
          prevFrame.score = 20;

          // Update also the score of the previous-previous frame it was a STRIKE
          if (prevFrame && prevPrevFrame.firstRoll === 'X') {
            prevPrevFrame.score = 20 + curFrame.firstRoll;
          }
        }
      
      // The current frame is STRIKE and it is not the tenth-frame
      } else if (curFrame.firstRoll === 'X' && curFrame.id < 10) {

        // Note: the score of the current frame is not updated
        // in the case of STRIKE because it requires the next two
        // rolls that are not done yet -> score of this frame is
        // updated after the next 2 rolls.
        
        // Update the score of the previous frame if it was a SPARE.
        if (prevFrame && prevFrame && prevFrame.secondRoll === '/') {
          prevFrame.score = 20;
        
        // Update the score of the previous-previous frame
        // if it was a STRIKE and the previous frame was a STRIKE too.
        // Note: the score of the previous frame is not updated yet
        // because it still waits the result of the next roll.
        } else if (prevFrame && prevPrevFrame && prevFrame.firstRoll === 'X' && prevPrevFrame.firstRoll === 'X') {
          prevPrevFrame.score = 30;
        }
      }

    // Tenth frame is a special case; let's process it separately.
    } else if (curFrame.id === 10) {
      
      // Three STRIKEs
      if (curFrame.firstRoll === 'X' && curFrame.secondRoll === 'X' && curFrame.thirdRoll === 'X') {
        
        curFrame.score = 30;
        
        // Update the 9th frame if it is STRIKE or SPARE
        if (prevFrame.firstRoll === 'X') {
          prevFrame.score = 30;

        } else if (prevFrame.secondRoll === '/') {
          prevFrame.score = 20;
        }

        // Update the 8th frame if it is STRIKE
        if (prevPrevFrame.firstRoll === 'X') {
          prevPrevFrame.score = 30;
        }

      // Two STRIKEs
      } else if (curFrame.firstRoll === 'X' && curFrame.secondRoll === 'X' && curFrame.thirdRoll !== null && curFrame.thirdRoll !== 'X') {

        curFrame.score = 20 + curFrame.thirdRoll;

        // Update the 9th frame if it is STRIKE or SPARE
        if (prevFrame.firstRoll === 'X') {
          prevFrame.score = 30;

        } else if (prevFrame.secondRoll === '/') {
          prevFrame.score = 20;
        }

        // Update the 8th frame if it is STRIKE
        if (prevPrevFrame.firstRoll === 'X') {
          prevPrevFrame.score = 30;
        }
    
      // One STRIKE and SPARE
      } else if (curFrame.firstRoll === 'X' && curFrame.thirdRoll === '/') {

        curFrame.score = 20;

        // Update the 9th frame if it is STRIKE or SPARE
        if (prevFrame.firstRoll === 'X') {
          prevFrame.score = 20 + curFrame.secondRoll;

        } else if (prevFrame.secondRoll === '/') {
          prevFrame.score = 20;
        }

        // Update the 8th frame if it is STRIKE
        if (prevPrevFrame.firstRoll === 'X') {
          prevPrevFrame.score = 30;
        }

      // One STRIKE and not SPARE
      } else if (curFrame.firstRoll === 'X' && curFrame.thirdRoll !== null && curFrame.thirdRoll !== '/') {

      curFrame.score = 10 + curFrame.secondRoll + curFrame.thirdRoll;

      // Update the 9th frame if it is STRIKE or SPARE
      if (prevFrame.firstRoll === 'X') {
        prevFrame.score = 20 + curFrame.secondRoll;

      } else if (prevFrame.secondRoll === '/') {
        prevFrame.score = 20;
      }

      // Update the 8th frame if it is STRIKE
      if (prevPrevFrame.firstRoll === 'X') {
        prevPrevFrame.score = 30;
      }

      // SPARE and STRIKE
      } else if (curFrame.secondRoll === '/' && curFrame.thirdRoll === 'X') {

        curFrame.score = 20;

        // Update the 9th frame if it is STRIKE or SPARE
        if (prevFrame.firstRoll === 'X') {
          prevFrame.score = 20;

        } else if (prevFrame.secondRoll === '/') {
          prevFrame.score = 10 + curFrame.firstRoll;
        }

      // SPARE and not STRIKE
      } else if (curFrame.secondRoll === '/' && curFrame.thirdRoll !== null && curFrame.thirdRoll !== 'X') {

        curFrame.score = 10 + curFrame.thirdRoll;

        // Update the 9th frame if it is STRIKE or SPARE
        if (prevFrame.firstRoll === 'X') {
          prevFrame.score = 20;

          // Update also the 8th frame if it is STRIKE
          if (prevPrevFrame.firstRoll === 'X') {
            prevPrevFrame.score = 20 + curFrame.firstRoll;
          }

        } else if (prevFrame.secondRoll === '/') {
          prevFrame.score = 10 + curFrame.firstRoll;
        }

      // No STRIKEs or SPARES
      } else if (curFrame.firstRoll !== 'X' && curFrame.secondRoll !== null && curFrame.secondRoll !== '/') {

        curFrame.score = curFrame.firstRoll + curFrame.secondRoll;

        // Update the 9th frame if it is STRIKE or SPARE
        if (prevFrame.firstRoll === 'X') {
          prevFrame.score = 10 + curFrame.score;

          // Update also the 8th frame if it is STRIKE
          if (prevPrevFrame.firstRoll === 'X') {
            prevPrevFrame.score = 20 + curFrame.firstRoll;
          }

        } else if (prevFrame.secondRoll === '/') {
          prevFrame.score = 10 + curFrame.firstRoll;
        }
      }
    }  
  };

  /**
   * Method for returning the score of the whole series.
   * 
   * @returns {Integer} The score of the series. 
   */
  getSeriesScore() {
    let seriesScore = 0;

    if (this.frames[this.frames.length - 1].score === null) {
      throw new Error('Score cannot be taken until the end of the game');
    }
    
    this.frames.forEach(frame => {
      seriesScore += frame.score;
    });
   
    return seriesScore;
  }
};

/**
 * Class definition for bowling game objects containing
 * the array of series and basic methods for manipulating
 * the game data.
 */
export class Bowling {
  /**
   * Constructor for initiating the bowling game object.
   * 
   * @param {Integer} numberOfSeries The amount of series in the game.
   */
  constructor(numberOfSeries = 1) {
    this.series = [];

    this.initSeries(numberOfSeries);
  };
  
  /**
   * Method for initiating series array with
   * BowlingSeries objects having empty default values.
   * 
   * @param {Integer} numberOfSeries The amount of series in the game.
   */
  initSeries(numberOfSeries) {
    for (let i = 1; i <= numberOfSeries; i++) {
      this.series.push(new Bowlingseries(i));
    }
  };

  /**
   * Method for making the bowling roll and recording its result.
   * 
   * @param {Integer} pins The amount of how many pinds were dropped.  
   * @param {Integer} seriesId The id of the series where the result is recorded.
   */
  roll(pins, seriesId = 1) {
    this.series.find(s => s.id === seriesId).setRoll(pins);    
  };

  /**
   * Method for returning the score of the series.
   * 
   * @param {Integer} seriesId The id of the series which score is wanted to get.
   * @returns {Integer} The score of the series.
   */
  score(seriesId = 1) {
    const series = this.series.find(s => s.id === seriesId);

    return series.getSeriesScore();
  };
};