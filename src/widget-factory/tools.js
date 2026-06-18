// ============================================================
// 📋 READ: Obtener estilos
// ============================================================

export function getStyles(el, prop) {
  if (!el) return null;
  if (prop) return el.style[prop] || null;

  const styles = {};
  for (let i = 0; i < el.style.length; i++) {
    const p = el.style[i];
    const v = el.style[p];
    if (v !== "") styles[p] = v;
  }
  return styles;
}

// ============================================================
// ➕ CREATE / UPDATE: Asignar estilos (COMPATIBLE)
// ============================================================

/**
 * Convierte un valor a formato CSS válido
 * - Array → "12px 24px"
 * - Número → "16px"
 * - String → se queda igual
 * - null/undefined → se ignora
 */
const toCSSValue = (value) => {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "number" ? `${v}px` : v)).join(" ");
  }
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

export function setStyles(el, prop, value) {
  // ✅ Validar elemento
  if (!el || !el.style) return el;

  // ✅ Caso 1: string (prop + value)
  if (typeof prop === "string") {
    const cssValue = toCSSValue(value);
    if (cssValue !== null) {
      try {
        el.style[prop] = cssValue;
      } catch (e) {
        // Silenciar error
      }
    }
    return el;
  }

  // ✅ Caso 2: objeto de estilos
  if (typeof prop === "object" && prop !== null) {
    // ✅ Recorrer todas las propiedades
    for (const [key, val] of Object.entries(prop)) {
      const cssValue = toCSSValue(val);
      if (cssValue !== null) {
        try {
          el.style[key] = cssValue;
        } catch (e) {
          // Silenciar error
        }
      }
    }
  }

  return el;
}

// ============================================================
// 🔄 TOGGLE: Alternar estilos
// ============================================================

export function updateStyle(el, prop, val1, val2) {
  if (!el || !prop) return el;

  const current = el.style[prop] || "";
  const newValue = current === val1 ? val2 : val1;
  const cssValue = toCSSValue(newValue);

  if (cssValue !== null) {
    try {
      el.style[prop] = cssValue;
    } catch (e) {
      // Silenciar error
    }
  }

  return el;
}

// ============================================================
// 🗑️ DELETE: Eliminar estilos
// ============================================================

export function removeStyles(el, prop) {
  if (!el) return el;

  if (typeof prop === "string") {
    try {
      el.style[prop] = "";
    } catch (e) {}
  } else if (Array.isArray(prop)) {
    prop.forEach((p) => {
      try {
        el.style[p] = "";
      } catch (e) {}
    });
  } else if (prop === undefined) {
    const styles = getStyles(el);
    Object.keys(styles).forEach((p) => {
      try {
        el.style[p] = "";
      } catch (e) {}
    });
  }
  return el;
}

// ============================================================
// 🔍 UTILITY: Verificar estilo
// ============================================================

export function hasStyle(el, prop) {
  if (!el || !prop) return false;
  return el.style[prop] !== "";
}

export function logStyles(el, label = "Estilos") {
  if (!el) {
    console.warn("⚠️ Elemento no válido");
    return null;
  }
  const styles = getStyles(el);
  console.log(`📋 ${label}:`);
  if (Object.keys(styles).length === 0) {
    console.log("  (Sin estilos inline)");
  } else {
    Object.entries(styles).forEach(([p, v]) => console.log(`  ${p}: ${v}`));
  }
  return styles;
}
