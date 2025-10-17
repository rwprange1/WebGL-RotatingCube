/**
 * This file contains th for the FPS Counter Class
 * it will allow us to keep track of the FPS with a simple grab time in ms
 * and compare it to the last time we were called
 * @author Richard Prange
 * @version 10/6/2025
 */


/**
 * The constructor for the fps counter
 */
function FpsCounter() {
    this.count = 0;
    this.fps = 0;
    this.prevSecond = Date.now();
}

/**
 * This function will allow us to keep track of the frames and
 * current time in ms which lets us calculate the fps
 */
FpsCounter.prototype.update = function() {
    this.count++;
    var currentTime = Date.now();
    var difference = currentTime - this.prevSecond;

    if (difference > 1000) { // Every second
        this.fps = this.count;
        this.count = 0;
        this.prevSecond = currentTime;
    }
};