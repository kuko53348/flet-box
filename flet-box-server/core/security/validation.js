// core/security/validation.js - Schema Validator (Pydantic-like) con patrones por defecto

/**
 * Schema Validator - Validate data against a schema
 * Similar to Pydantic in Python.
 * Los campos de tipo 'string' tienen un patrón seguro por defecto.
 */
export class SchemaValidator {
  constructor(schema) {
    this.schema = schema;
  }

  /**
   * Validate data against the schema
   * @param {Object} data - Data to validate
   * @returns {Object} { valid, errors, data }
   */
  validate(data) {
    const errors = [];
    const result = {};

    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field];
      const {
        type,
        required = false,
        min,
        max,
        minLength,
        maxLength,
        pattern = null, // si no se da, se usa el patrón por defecto
        message,
        enum: enumValues,
        default: defaultValue,
      } = rules;

      // Valor por defecto
      if (value === undefined && defaultValue !== undefined) {
        result[field] = defaultValue;
        continue;
      }

      // Campo requerido
      if (required && (value === undefined || value === null || value === "")) {
        errors.push({ field, message: message || `${field} is required` });
        continue;
      }

      // Campo vacío y no requerido: se salta
      if (value === undefined || value === null || value === "") {
        result[field] = value;
        continue;
      }

      // Validación por tipo
      let valid = true;

      switch (type) {
        case "string": {
          if (typeof value !== "string") {
            errors.push({ field, message: `${field} must be a string` });
            valid = false;
            break;
          }

          // Patrón por defecto para strings (seguro)
          const defaultPattern = "^[a-zA-Z0-9 .,!?¿¡\\-:+=@_()\\[\\]{}]*$";
          const finalPattern = pattern || defaultPattern;

          try {
            if (!new RegExp(finalPattern).test(value)) {
              errors.push({
                field,
                message: message || `${field} contains invalid characters`,
              });
              valid = false;
            }
          } catch (e) {
            errors.push({ field, message: `Invalid pattern for ${field}` });
            valid = false;
          }

          if (valid) {
            if (minLength !== undefined && value.length < minLength) {
              errors.push({
                field,
                message: `${field} must be at least ${minLength} characters`,
              });
            }
            if (maxLength !== undefined && value.length > maxLength) {
              errors.push({
                field,
                message: `${field} must be at most ${maxLength} characters`,
              });
            }
            if (enumValues && !enumValues.includes(value)) {
              errors.push({
                field,
                message: `${field} must be one of: ${enumValues.join(", ")}`,
              });
            }
          }
          break;
        }

        case "number":
        case "integer": {
          if (typeof value !== "number" || isNaN(value)) {
            errors.push({ field, message: `${field} must be a number` });
          } else {
            if (min !== undefined && value < min)
              errors.push({
                field,
                message: `${field} must be at least ${min}`,
              });
            if (max !== undefined && value > max)
              errors.push({
                field,
                message: `${field} must be at most ${max}`,
              });
          }
          break;
        }

        case "boolean": {
          if (typeof value !== "boolean") {
            errors.push({ field, message: `${field} must be a boolean` });
          }
          break;
        }

        case "email": {
          if (
            typeof value !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ) {
            errors.push({ field, message: `${field} must be a valid email` });
          }
          break;
        }

        case "url": {
          if (typeof value !== "string" || !/^https?:\/\/[^\s]+$/.test(value)) {
            errors.push({ field, message: `${field} must be a valid URL` });
          }
          break;
        }

        case "date": {
          if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push({
              field,
              message: `${field} must be a valid date (YYYY-MM-DD)`,
            });
          }
          break;
        }

        case "uuid": {
          if (
            typeof value !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              value,
            )
          ) {
            errors.push({ field, message: `${field} must be a valid UUID` });
          }
          break;
        }

        case "array": {
          if (!Array.isArray(value)) {
            errors.push({ field, message: `${field} must be an array` });
          } else {
            if (min !== undefined && value.length < min)
              errors.push({
                field,
                message: `${field} must have at least ${min} items`,
              });
            if (max !== undefined && value.length > max)
              errors.push({
                field,
                message: `${field} must have at most ${max} items`,
              });
            if (rules.items) {
              const itemValidator = new SchemaValidator({ item: rules.items });
              for (let i = 0; i < value.length; i++) {
                const sub = itemValidator.validate({ item: value[i] });
                if (!sub.valid) {
                  sub.errors.forEach((e) =>
                    errors.push({
                      field: `${field}[${i}].${e.field}`,
                      message: e.message,
                    }),
                  );
                }
              }
            }
          }
          break;
        }

        case "object": {
          if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
          ) {
            errors.push({ field, message: `${field} must be an object` });
          } else if (rules.properties) {
            const subValidator = new SchemaValidator(rules.properties);
            const subResult = subValidator.validate(value);
            if (!subResult.valid) {
              subResult.errors.forEach((e) =>
                errors.push({
                  field: `${field}.${e.field}`,
                  message: e.message,
                }),
              );
            }
          }
          break;
        }

        default: {
          errors.push({ field, message: `Unknown type: ${type}` });
        }
      }

      // Si no hubo errores en este campo, guardamos el valor
      if (!errors.some((e) => e.field === field)) {
        result[field] = value;
      }
    }

    // Strict mode: campos extra no permitidos
    if (this.schema.strict) {
      const allowed = Object.keys(this.schema).filter((k) => k !== "strict");
      for (const key of Object.keys(data)) {
        if (!allowed.includes(key)) {
          errors.push({
            field: key,
            message: `Extra field not allowed: ${key}`,
          });
        }
      }
    }

    return { valid: errors.length === 0, errors, data: result };
  }
}

export default { SchemaValidator };
