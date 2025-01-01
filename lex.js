const math = require("mathjs");
const _ = require("lodash"); // For utility functions like range
const natural = require("natural"); // For text tokenization
const { createCanvas } = require("canvas"); // For plotting (alternative to matplotlib)

// Preprocessing function
function preprocess(text) {
  /**
   * Preprocess text (minimal).
   * 1. Lowercase
   * 2. Removes digits
   * 3. Removes variations of dashes and hyphens
   *
   * @param {string} text - Input text
   * @return {string} Preprocessed text
   */
  text = text.toLowerCase().replace(/[0-9]+/g, "");
  text = text.replace(/[–—-]/g, "");
  return text;
}

// Tokenize function
function tokenize(text) {
  /**
   * Tokenize text into a list of tokens using built-in methods.
   * @param {string} text - Input text
   * @return {Array<string>} Tokenized words
   */
  text = preprocess(text);
  return text.split(/\s+/g).filter((word) => word.length > 0);
}

// Utility function: Generate segments
function segmentGenerator(list, segmentSize) {
  /**
   * Split a list into segments of a given size.
   * @param {Array} list - List of items to segment
   * @param {number} segmentSize - Size of each segment
   * @return {Array<Array>} Segmented list
   */
  const segments = [];
  for (let i = 0; i < list.length; i += segmentSize) {
    segments.push(list.slice(i, i + segmentSize));
  }
  return segments;
}

// Utility function: Sliding window
function slidingWindow(sequence, windowSize = 2) {
  /**
   * Return a sliding window over a sequence.
   * @param {Array|string} sequence - Input sequence
   * @param {number} windowSize - Size of the window
   * @return {Array<Array|string>} Sliding windows
   */
  const windows = [];
  for (let i = 0; i <= sequence.length - windowSize; i++) {
    windows.push(sequence.slice(i, i + windowSize));
  }
  return windows;
}

// LexicalRichness class
class LexicalRichness {
  /**
   * Object containing tokenized text and methods to compute Lexical Richness.
   * @param {string|Array<string>} text - Input text (string or list of tokens)
   * @param {function} preprocessor - Optional preprocessor function
   * @param {function} tokenizer - Optional tokenizer function
   */
  constructor(text, preprocessor = preprocess, tokenizer = tokenize) {
    this.preprocessor = preprocessor;
    this.tokenizer = tokenizer;

    if (typeof text === "string") {
      text = this.preprocessor(text);
      this.wordlist = this.tokenizer(text);
    } else if (Array.isArray(text)) {
      this.wordlist = text;
    } else {
      throw new Error("Input text must be a string or an array of tokens.");
    }

    this.words = this.wordlist.length;
    this.terms = new Set(this.wordlist).size;
  }

  // Type-Token Ratio (TTR)
  get ttr() {
    return this.terms / this.words;
  }

  // Root TTR (RTTR)
  get rttr() {
    return this.terms / Math.sqrt(this.words);
  }

  // Corrected TTR (CTTR)
  get cttr() {
    return this.terms / Math.sqrt(2 * this.words);
  }

  // Herdan's C
  get herdan() {
    return Math.log(this.terms) / Math.log(this.words);
  }

  // Maas's TTR
  get maas() {
    const logW = Math.log(this.words);
    const logT = Math.log(this.terms);
    return (logW - logT) / logW ** 2;
  }

  // Mean Segmental TTR (MSTTR)
  msttr(segmentSize = 100, discard = true) {
    const segments = segmentGenerator(this.wordlist, segmentSize);
    if (discard && segments[segments.length - 1].length < segmentSize) {
      segments.pop();
    }

    const ttrs = segments.map((segment) => {
      const uniqueTerms = new Set(segment).size;
      return uniqueTerms / segment.length;
    });

    return _.mean(ttrs);
  }

  // Moving Average TTR (MATTR)
  mattr(windowSize = 100) {
    if (windowSize > this.words) {
      throw new Error(
        "Window size cannot be greater than the total number of words."
      );
    }

    const windows = slidingWindow(this.wordlist, windowSize);
    const ttrs = windows.map((window) => {
      const uniqueTerms = new Set(window).size;
      return uniqueTerms / window.length;
    });

    return _.mean(ttrs);
  }

  // Additional methods like MTLD and HDD can be implemented similarly
}

// put your text bellow
const text = "The quick brown fox jumps over the lazy dog.";

const lex = new LexicalRichness(text);

console.log("TTR:", lex.ttr);
console.log("RTTR:", lex.rttr);
console.log("CTTR:", lex.cttr);
console.log("Herdan's C:", lex.herdan);
console.log("Maas's TTR:", lex.maas);
console.log("MSTTR:", lex.msttr(5));
console.log("MATTR:", lex.mattr(3));

module.exports = {
  LexicalRichness,
  preprocess,
  tokenize,
  segmentGenerator,
  slidingWindow,
};
