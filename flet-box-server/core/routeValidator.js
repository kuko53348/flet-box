// core/routeValidator.js - Valida que la ruta exista en la definición

export const routeValidator = (routes) => {
  return (req, res, next) => {
    const path = req.url.split("?")[0];

    // Verificar si la ruta existe en las definiciones
    let routeExists = false;
    for (const [routePath] of Object.entries(routes)) {
      // Convertir ruta con parámetros a regex
      const regex = new RegExp(
        "^" + routePath.replace(/:([^/]+)/g, "([^/]+)") + "$",
      );
      if (regex.test(path)) {
        routeExists = true;
        break;
      }
    }

    if (!routeExists) {
      return res.error("Not found", 404);
    }

    next();
  };
};
