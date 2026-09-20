// core/autoValidate.js
import { SchemaValidator } from "./security/validation.js";

export const autoValidate = (req, res, next) => {
  // Find the matching route
  const route = req._route; // You need to assign the route in server.js
  if (!route) return next();

  // Find the first schema on the route
  const schemas = route.schemas || {};
  const schemaKeys = Object.keys(schemas);
  if (schemaKeys.length === 0) return next();

  // Take the first schema (or you could choose by name)
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
