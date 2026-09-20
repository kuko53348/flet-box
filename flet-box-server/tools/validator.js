// core/validator.js - Data type validation
const validators = {
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && !isNaN(value),
  boolean: (value) => typeof value === "boolean",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value) => /^https?:\/\/[^\s]+$/.test(value),
  date: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value), // format YYYY-MM-DD
  datetime: (value) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value),
  alphanumeric: (value) => /^[a-zA-Z0-9]*$/.test(value),
  text: (value) => /^[a-zA-Z0-9 .,!?¿¡\-:+=@]*$/.test(value), // safe for texts
  uuid: (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    ),
  // you can add more types as needed
};

/**
 * Validates an object against a type schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - { field: { type: 'email', required: true, ... } }
 * @returns {Object} { valid: boolean, errors: Array, data: Object }
 */
export const validateByType = (data, schema) => {
  const errors = [];
  const result = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const { type, required = false, message } = rules;

    // If required and not present
    if (required && (value === undefined || value === null || value === "")) {
      errors.push({ field, message: message || `${field} is required` });
      continue;
    }

    // If not required and empty, validation is skipped
    if (!required && (value === undefined || value === null || value === "")) {
      result[field] = value;
      continue;
    }

    // Validate type
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

    // If valid, save the value (already validated)
    result[field] = value;
  }

  // If there are extra fields not defined in the schema, reject them (optional)
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
