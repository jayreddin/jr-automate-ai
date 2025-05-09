/**
 * Basic page interaction script
 * Handles counter increment and logo loading
 * @module PageScript
 */

/** @type {number} Counter value */
let count = 0;

/**
 * Increments counter and updates display
 * @function incrementCounter
 */
function incrementCounter() {
  count += 1;
  document.getElementById('counter').innerText = 'Count ' + count;
}

// Initialize logo on page load
document.addEventListener("DOMContentLoaded", function() {
  const imgElement = document.getElementById("logo");
  if (imgElement) {
    imgElement.src = 'https://www.jdoodle.com/assets/images/JDoodleLogo.png';
  }
});