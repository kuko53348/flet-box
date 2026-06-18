// src/components/flet-box/tools/clipboard.js

export const clipboard = {
  /**
   * Copia texto al portapapeles (síncrono para el usuario)
   * Internamente maneja async pero tú no necesitas await
   * @param {string} text - Texto a copiar
   * @returns {void} - No retorna nada, solo ejecuta
   */
  copy: (text) => {
    // Método moderno (async pero manejado internamente)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Clipboard failed:", err);
        clipboard._fallbackCopy(text);
      });
    } else {
      // Fallback para navegadores antiguos
      clipboard._fallbackCopy(text);
    }
  },

  /**
   * Fallback usando textarea (síncrono)
   * @private
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
   * Copia con feedback visual (síncrono para el usuario)
   * @param {string} text - Texto a copiar
   * @param {HTMLElement} element - Elemento donde mostrar feedback
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
   * Lee texto del portapapeles (asíncrono, este sí necesita await)
   * @returns {Promise<string>}
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
