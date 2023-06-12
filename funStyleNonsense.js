const itrPerChange = 5
const itrToRealStr = itrPerChange * 3
const tagText = document.querySelector('#tagText')

// math utility functions
const { max, min, floor, random } = Math
const clamp = (x, a, b) => max(min(a, b), min(x, max(a, b)))

/**
 * Generates a random string of lowercase letters with the specified length.
 *
 * @param {number} length - The length of the random string to generate.
 * @returns {string} - A random string of lowercase letters.
 */
function randomString(length) {
  return Array.from({ length }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('')
}

function randIter(i, startLen, endLen, targetStr, direction = 1) {
  // determine how long the string should be right now based on the number of iterations taken
  const len = clamp(startLen + floor(i / itrPerChange) * direction, startLen, endLen)
  // determine how much of the string should be the target
  const realStrLen = max(floor((i - itrToRealStr) / itrPerChange), 0)
  // set tag to a combination of the target and random letters
  tagText.innerText = targetStr.slice(0, realStrLen) + randomString(len - realStrLen)
  // continue the loop if we aren't done yet
  if (realStrLen !== 8) {
    setTimeout(() => randIter(i + 1, startLen, endLen, targetStr, direction), 25)
  }
}

// alternate between setting the text to bulk and lossless, every 5 seconds
let isBulk = true
setInterval(() => {
  if (isBulk) {
    randIter(0, 4, 8, 'lossless')
    isBulk = false
  } else {
    randIter(0, 8, 4, 'bulk', -1)
    isBulk = true
  }
}, 5000)
