// core/inferSchema.js

/**
 * Infiere un JSON Schema a partir de un objeto de ejemplo
 * @param {Object} example - Objeto de ejemplo
 * @param {string} name - Nombre del esquema (opcional)
 * @returns {Object} JSON Schema
 */
export const inferSchema = (example, name = "Schema") => {
  const schema = {
    type: "object",
    properties: {},
    required: [],
  };

  for (const [key, value] of Object.entries(example)) {
    const prop = {};

    if (Array.isArray(value)) {
      prop.type = "array";
      if (value.length > 0) {
        prop.items = inferSchemaItem(value[0]);
      }
    } else if (value === null) {
      prop.type = "null";
    } else {
      const type = typeof value;
      prop.type = type;
      if (type === "string") {
        prop.example = value;
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          prop.format = "email";
        } else if (/^https?:\/\/[^\s]+$/.test(value)) {
          prop.format = "url";
        }
      } else if (type === "number" || type === "integer") {
        prop.example = value;
      } else if (type === "boolean") {
        prop.example = value;
      }
    }

    schema.properties[key] = prop;
    schema.required.push(key);
  }

  return schema;
};

const inferSchemaItem = (value) => {
  if (Array.isArray(value)) {
    return { type: "array", items: inferSchemaItem(value[0]) };
  }
  if (value === null) return { type: "null" };
  const type = typeof value;
  if (type === "object") {
    return inferSchema(value);
  }
  return { type };
};
