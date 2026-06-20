// ============================================================
// 📋 READ: Get styles
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
// ➕ CREATE / UPDATE: Assign styles
// ============================================================

const toCSSValue = (key, value) => {
  if (value === undefined || value === null) return null;

  // ✅ Array → "12px 24px"
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "number" ? `${v}px` : v)).join(" ");
  }

  // ✅ Number → apply unit or no unit
  if (typeof value === "number") {
    // ✅ Props that should NOT have units
    const noUnitProps = new Set([
      "flex",
      "flexGrow",
      "flexShrink",
      "order",
      "zIndex",
      "opacity",
      "fontWeight",
      "lineHeight",
      "scale",
      "rotate",
      "rotateX",
      "rotateY",
      "rotateZ",
    ]);

    if (noUnitProps.has(key)) {
      return value; // ✅ No unit
    }
    return `${value}px`; // ✅ Add px
  }

  // ✅ String → keep as is
  return value;
};

export function setStyles(el, prop, value) {
  // ✅ Validate element
  if (!el || !el.style) return el;

  // ✅ Case 1: string (prop + value)
  if (typeof prop === "string") {
    const cssValue = toCSSValue(prop, value);
    if (cssValue !== null) {
      try {
        el.style[prop] = cssValue;
      } catch (e) {
        // Silently ignore errors
      }
    }
    return el;
  }

  // ✅ Case 2: styles object
  if (typeof prop === "object" && prop !== null) {
    for (const [key, val] of Object.entries(prop)) {
      const cssValue = toCSSValue(key, val);
      if (cssValue !== null) {
        try {
          el.style[key] = cssValue;
        } catch (e) {
          // Silently ignore errors
        }
      }
    }
  }

  return el;
}

// ============================================================
// 🔄 TOGGLE: Toggle styles
// ============================================================

export function updateStyle(el, prop, val1, val2) {
  if (!el || !prop) return el;

  const current = el.style[prop] || "";
  const newValue = current === val1 ? val2 : val1;
  const cssValue = toCSSValue(prop, newValue);

  if (cssValue !== null) {
    try {
      el.style[prop] = cssValue;
    } catch (e) {
      // Silently ignore errors
    }
  }

  return el;
}

// ============================================================
// 🗑️ DELETE: Remove styles
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
// 🔍 UTILITY: Check styles
// ============================================================

export function hasStyle(el, prop) {
  if (!el || !prop) return false;
  return el.style[prop] !== "";
}

export function logStyles(el, label = "Styles") {
  if (!el) {
    console.warn("⚠️ Invalid element");
    return null;
  }
  const styles = getStyles(el);
  console.log(`📋 ${label}:`);
  if (Object.keys(styles).length === 0) {
    console.log("  (No inline styles)");
  } else {
    Object.entries(styles).forEach(([p, v]) => console.log(`  ${p}: ${v}`));
  }
  return styles;
}
