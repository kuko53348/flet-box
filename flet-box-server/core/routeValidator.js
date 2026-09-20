// core/routeValidator.js - Validates that the route exists in the definitions

export const routeValidator = (routes) => {
  return (req, res, next) => {
    const path = req.url.split("?")[0];

    // Check whether the route exists in the definitions
    let routeExists = false;
    for (const [routePath] of Object.entries(routes)) {
      // Convert a route with parameters to regex
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
