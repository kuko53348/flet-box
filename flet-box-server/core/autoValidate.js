// core/autoValidate.js
import { SchemaValidator } from "./security/validation.js";

export const autoValidate = (req, res, next) => {
  // Buscar la ruta que coincida
  const route = req._route; // Necesitas asignar la ruta en server.js
  if (!route) return next();

  // Buscar el primer esquema en la ruta
  const schemas = route.schemas || {};
  const schemaKeys = Object.keys(schemas);
  if (schemaKeys.length === 0) return next();

  // Tomar el primer esquema (o podrías elegir por nombre)
  const schemaName = schemaKeys[0];
  const schema = schemas[schemaName];

  const validator = new SchemaValidator(schema);
  const result = validator.validate(req.body);

  if (!result.valid) {
    return res.error(result.errors[0].message, 400);
  }

  req.body = result.data;
  next();
};
