/**
 * @file bin/utils/images/unsupported.js
 * @description The error every decoder throws for a feature it will never read.
 *
 * It lives apart from `index.js` because the decoders are imported by it: sharing
 * the class from the barrel would be a circular import, and a class declaration
 * half-initialised during a cycle is how `instanceof` starts lying.
 */

/**
 * Thrown when a file is a format, or a mode of a format, this tool will never
 * read. The command prints it as a declined asset rather than a failure: the
 * file is fine, the feature is simply out of scope, and a folder full of WebP
 * must not look like a broken build.
 */
export class UnsupportedImage extends Error {
  /**
   * @param {string} format - Human-readable format name.
   * @param {string} reason - Why it cannot be converted.
   */
  constructor(format, reason) {
    super(`${format}: ${reason}`);
    this.name = "UnsupportedImage";
    this.format = format;
    this.reason = reason;
  }
}

export default UnsupportedImage;
