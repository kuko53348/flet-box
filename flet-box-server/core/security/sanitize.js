// core/security/sanitize.js - Limpieza de texto (elimina caracteres peligrosos)

/**
 * Limpia un string eliminando caracteres peligrosos
 * - Permite: letras, números, espacios, ., @, -, _, :, ,, ¡, ¿
 * - Elimina: < > ; ' " = & | $ ( ) [ ] { } / \ * ` # % ^ ~
 */
export const sanitizeText = (input) => {
  if (typeof input !== "string") return input;

  // 1. Eliminar caracteres peligrosos
  const cleaned = input
    .replace(/[<>;'"=&|$()\[\]{}`#%^~\\/*]/g, "") // Caracteres peligrosos
    .replace(/javascript:/gi, "") // Eliminar javascript:
    .replace(/on\w+=/gi, "") // Eliminar onerror, onclick, etc.
    .replace(/alert\(/gi, "") // Eliminar alert(
    .replace(/eval\(/gi, "") // Eliminar eval(
    .replace(/document\./gi, "") // Eliminar document.
    .replace(/window\./gi, "") // Eliminar window.
    .replace(/<script/gi, "") // Eliminar <script
    .replace(/<\/script>/gi, ""); // Eliminar </script>

  // 2. Eliminar palabras clave de ataques (como texto completo)
  const attackKeywords = [
    "script",
    "javascript",
    "onerror",
    "onload",
    "onclick",
    "union",
    "select",
    "drop",
    "insert",
    "delete",
    "update",
    "exec",
    "xp_cmdshell",
    "sp_executesql",
    "rm",
    "wget",
    "curl",
    "whoami",
    "id",
    "ls",
    "system",
    "shell_exec",
    "passthru",
    "popen",
    "proc_open",
    "jndi",
    "ldap",
    "rmi",
    "dns",
    "__proto__",
    "constructor",
    "prototype",
  ];

  let result = cleaned;
  const lower = result.toLowerCase();
  for (const keyword of attackKeywords) {
    // Buscar como palabra completa (rodeada de espacios o límites)
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    result = result.replace(regex, "");
  }

  // 3. Eliminar múltiples espacios y trim
  result = result.replace(/\s+/g, " ").trim();

  return result;
};

/**
 * Sanitiza recursivamente un objeto
 */
export const sanitizeObject = (obj) => {
  if (typeof obj === "string") {
    return sanitizeText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  if (obj !== null && typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Limpiar también las claves
      const cleanKey = sanitizeText(key);
      result[cleanKey] = sanitizeObject(value);
    }
    return result;
  }
  return obj;
};

export default {
  sanitizeText,
  sanitizeObject,
};
