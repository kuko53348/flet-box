// translator.js
/**
 * # GOOGLE TRANSLATOR MODULE
 *
 * Simple functions to translate text and handle code blocks
 *
 * ## FUNCTIONS:
 *
 * ### translate(from, to, lang)
 * Translate text from one language to another
 * - `from`: text to translate
 * - `to`: target language (es, en, fr, de, etc.)
 * - `lang`: source language (auto by default)
 * - Returns: Promise<string>
 *
 * ### codeExtraction(message, delimiter)
 * Extract code blocks from a message
 * - `message`: text with code blocks
 * - `delimiter`: code delimiter (``` by default)
 * - Returns: [formatted_message, dictionary]
 *
 * ### codeInput(message, dictionary)
 * Insert code blocks back into a message
 * - `message`: text with markers (STR_GPT_N)
 * - `dictionary`: code dictionary
 * - Returns: string with code blocks restored
 *
 * ### translateWithCode(message, target, source)
 * Translate text while preserving code blocks
 * - `message`: text with code blocks
 * - `target`: target language
 * - `source`: source language (auto by default)
 * - Returns: Promise<string>
 *
 * ## EXAMPLES:
 *
 * ```javascript
 * // Simple translation
 * const result = await translate('hello world', 'es');
 * // result: "hola mundo"
 *
 * // Extract code blocks
 * const [formatted, dict] = codeExtraction('```js\nconsole.log("hi")\n```');
 * // formatted: "STR_GPT_1\n"
 * // dict: { STR_GPT_1: 'js\nconsole.log("hi")\n' }
 *
 * // Restore code blocks
 * const restored = codeInput('STR_GPT_1', dict);
 * // restored: '```js\nconsole.log("hi")\n```'
 *
 */

import translateLib from "translate";

// Configure
translateLib.engine = "google";

// ============================================================
// TRANSLATE
// ============================================================

/**
 * Translate text
 * @param {string} from - Text to translate
 * @param {string} to - Target language (es, en, fr...)
 * @param {string} lang - Source language (auto by default)
 * @returns {Promise<string>}
 */
export async function translate(from, to, lang = "auto") {
  try {
    return await translateLib(from, { from: lang, to: to });
  } catch (error) {
    console.error("Translation error:", error.message);
    return from;
  }
}

// ============================================================
// CODE EXTRACTION
// ============================================================

/**
 * Extract code blocks from message
 * @param {string} message - Message with code blocks
 * @param {string} delimiter - Code delimiter (default: ```)
 * @returns {[string, Object]}
 */
export function codeExtraction(message, delimiter = "```") {
  const parts = message.split(delimiter);
  const dict = {};
  let num = 1;
  let result = "";

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const key = `STR_GPT_${num}`;
      result += `${key}\n`;
      dict[key] = parts[i];
      num++;
    } else {
      result += `${parts[i]}\n`;
    }
  }

  return [result, dict];
}

// ============================================================
// CODE INPUT
// ============================================================

/**
 * Insert code blocks back into message
 * @param {string} message - Message with markers
 * @param {Object} dictionary - Code dictionary
 * @returns {string}
 */
export function codeInput(message, dictionary) {
  let result = message;
  for (const [key, value] of Object.entries(dictionary)) {
    result = result.replace(key, `\`\`\`${value}\`\`\``);
  }
  return result;
}

// ============================================================
// TRANSLATE WITH CODE
// ============================================================

/**
 * Translate message and preserve code blocks
 * @param {string} message - Message with code blocks
 * @param {string} target - Target language
 * @param {string} source - Source language (auto by default)
 * @returns {Promise<string>}
 */
export async function translateWithCode(message, target, source = "auto") {
  const [formatted, dict] = codeExtraction(message);
  const translated = await translate(formatted, target, source);
  return codeInput(translated, dict);
}
