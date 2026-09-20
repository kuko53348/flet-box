// src/components/flet-box/tools/clipboard.js

/**
 * Clipboard utility — provides a synchronous-feeling API for reading from and
 * writing to the system clipboard.
 *
 * `copy` and `copyWithFeedback` are intentionally synchronous from the caller's
 * perspective: the underlying async Clipboard API is handled internally so
 * callers do not need to `await` them. `read` is genuinely async and must be
 * awaited.
 */
export const clipboard = {
  /**
   * Copies text to the clipboard.
   *
   * Uses the modern async `navigator.clipboard.writeText` API when available,
   * falling back to a hidden `<textarea>` + `execCommand("copy")` for older
   * browsers. Errors from the async path are caught and silently rerouted to
   * the fallback.
   *
   * @param {string} text - Text to copy.
   * @returns {void}
   */
  copy: (text) => {
    // Modern path — async internally but fire-and-forget for the caller
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Clipboard failed:", err);
        clipboard._fallbackCopy(text);
      });
    } else {
      // Fallback for browsers that do not support the Clipboard API
      clipboard._fallbackCopy(text);
    }
  },

  /**
   * Legacy synchronous fallback that copies text using a hidden `<textarea>`
   * and the deprecated `execCommand("copy")`.
   *
   * @private
   * @param {string} text - Text to copy.
   * @returns {void}
   */
  _fallbackCopy: (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  },

  /**
   * Copies text to the clipboard and briefly updates a DOM element to show
   * visual confirmation (a checkmark for 1 second).
   *
   * @param {string} text - Text to copy.
   * @param {HTMLElement} element - Element whose content is temporarily replaced
   *   with a `"✓"` and whose background turns green as feedback.
   * @returns {void}
   */
  copyWithFeedback: (text, element) => {
    clipboard.copy(text);

    if (element) {
      const originalText = element.textContent;
      const originalBg = element.style.backgroundColor;

      element.textContent = "✓";
      element.style.backgroundColor = "#27ae60";

      setTimeout(() => {
        element.textContent = originalText;
        element.style.backgroundColor = originalBg;
      }, 1000);
    }
  },

  /**
   * Reads the current text content of the clipboard.
   *
   * Unlike `copy`, this method IS async and must be awaited. It returns an
   * empty string on failure (e.g. when permission is denied).
   *
   * @returns {Promise<string>} The clipboard text, or `""` on error.
   *
   * @example
   * const text = await clipboard.read();
   */
  read: async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error("Failed to read:", error);
      return "";
    }
  },
};

export default clipboard;
