// core/validator.js - Validación de datos por tipo
const validators = {
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && !isNaN(value),
  boolean: (value) => typeof value === "boolean",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value) => /^https?:\/\/[^\s]+$/.test(value),
  date: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value), // formato YYYY-MM-DD
  datetime: (value) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value),
  alphanumeric: (value) => /^[a-zA-Z0-9]*$/.test(value),
  text: (value) => /^[a-zA-Z0-9 .,!?¿¡\-:+=@]*$/.test(value), // seguro para textos
  uuid: (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    ),
  // puedes añadir más tipos según necesites
};

/**
 * Valida un objeto contra un esquema de tipos
 * @param {Object} data - Datos a validar
 * @param {Object} schema - { campo: { type: 'email', required: true, ... } }
 * @returns {Object} { valid: boolean, errors: Array, data: Object }
 */
export const validateByType = (data, schema) => {
  const errors = [];
  const result = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const { type, required = false, message } = rules;

    // Si es requerido y no está presente
    if (required && (value === undefined || value === null || value === "")) {
      errors.push({ field, message: message || `${field} is required` });
      continue;
    }

    // Si no es requerido y está vacío, se omite la validación
    if (!required && (value === undefined || value === null || value === "")) {
      result[field] = value;
      continue;
    }

    // Validar tipo
    const validator = validators[type];
    if (!validator) {
      errors.push({ field, message: `Unknown type '${type}' for ${field}` });
      continue;
    }

    if (!validator(value)) {
      errors.push({
        field,
        message: message || `${field} must be a valid ${type}`,
      });
      continue;
    }

    // Si pasa, guardamos el valor (ya validado)
    result[field] = value;
  }

  // Si hay campos extra no definidos en el esquema, los rechazamos (opcional)
  const extraFields = Object.keys(data).filter((key) => !schema[key]);
  if (extraFields.length > 0) {
    errors.push({
      field: extraFields.join(", "),
      message: "Extra fields not allowed",
    });
  }

  return { valid: errors.length === 0, errors, data: result };
};

export default validators;
