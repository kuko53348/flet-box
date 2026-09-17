// core/createDoc.js - API documentation with schemas, responses, and examples in curl, Python, JavaScript

/**
 * Generate a documentation object from routes.
 *
 * This function processes all route definitions and builds a structured
 * documentation object including global schemas, endpoint details,
 * HTTP methods, responses, and example requests in curl, Python, and JavaScript.
 *
 * @param {Object} routes - Processed routes from Api().
 * @param {string} baseUrl - Base URL of the server (e.g., 'http://localhost:3000').
 * @returns {Object} Documentation object with grouped endpoints, baseUrl, and schemas.
 *
 * @example
 * const docs = generateDocs(routes, 'http://localhost:8000');
 * console.log(docs.grouped.tasks);
 */
export const generateDocs = (routes, baseUrl) => {
  const docsData = {};
  const globalSchemas = {};

  // Collect all schemas from routes
  for (const [, route] of Object.entries(routes)) {
    if (route.schemas) {
      Object.assign(globalSchemas, route.schemas);
    }
  }

  // Build documentation for each route
  for (const [, route] of Object.entries(routes)) {
    if (route.originalPath === "/docs" || route.originalPath === "_getDocs")
      continue;

    const path = route.originalPath;
    const examplePath = path.replace(/:([^/]+)/g, "1");

    if (!docsData[examplePath]) {
      docsData[examplePath] = {
        methods: [],
        tag: route.tag || "general",
        description: route.description || "",
        schemas: route.schemas || {},
        responses: route.responses || {},
        examples: {},
      };
    }

    if (!docsData[examplePath].methods.includes(route.method)) {
      docsData[examplePath].methods.push(route.method);
    }

    const method = route.method;
    const url = `${baseUrl}${examplePath}`;
    const { headers, body } = buildRequestParts(method, examplePath);

    // Generate examples in three languages
    docsData[examplePath].examples[method] = {
      curl: generateCurl(method, url, headers, body),
      python: generatePython(method, url, headers, body),
      javascript: generateJavaScript(method, url, headers, body),
    };

    if (route.responses && Object.keys(route.responses).length > 0) {
      docsData[examplePath].responses = {
        ...docsData[examplePath].responses,
        ...route.responses,
      };
    }
  }

  // Group by tag
  const grouped = {};
  for (const [path, info] of Object.entries(docsData)) {
    const tag = info.tag;
    if (!grouped[tag]) grouped[tag] = [];
    grouped[tag].push({
      path,
      methods: info.methods,
      description: info.description,
      schemas: info.schemas,
      responses: info.responses,
      examples: info.examples,
    });
  }

  return {
    grouped,
    baseUrl,
    schemas: globalSchemas,
    message:
      "📚 Automatic API documentation with schemas, responses, and examples in curl, Python & JavaScript",
  };
};

// ============================================================
// Helper functions to build examples
// ============================================================

function buildRequestParts(method, path) {
  const headers = new Set();
  if (path.startsWith("/tasks") && method !== "POST") {
    headers.add(`-H "x-user-id: 1"`);
  }
  if (method === "POST" || method === "PUT") {
    headers.add(`-H "Content-Type: application/json"`);
  }
  if (path === "/login") {
    headers.add(`-H "Content-Type: application/json"`);
  }

  let body = "";
  if (method === "POST" && path === "/login") {
    body = '{"username":"admin","password":"1234"}';
  } else if (method === "POST" && path === "/tasks") {
    body = '{"title":"New task","completed":false}';
  } else if (method === "PUT" && path.startsWith("/tasks/")) {
    body = '{"title":"Updated task","completed":true}';
  }

  return { headers, body };
}

function generateCurl(method, url, headers, body) {
  let curl = `curl -X ${method} ${url}`;
  const headerArray = Array.from(headers);
  if (headerArray.length) {
    curl += " " + headerArray.join(" ");
  }
  if (body) {
    curl += ` -d '${body}'`;
  }
  return curl;
}

function generatePython(method, url, headers, body) {
  let code = `import requests\n\n`;
  code += `response = requests.${method.toLowerCase()}('${url}'`;

  const headerArray = Array.from(headers);
  if (headerArray.length > 0) {
    code += `, headers={\n`;
    const items = headerArray.map((h) => {
      const [key, value] = h.replace('-H "', "").replace('"', "").split(": ");
      return `    '${key}': '${value}'`;
    });
    code += items.join(",\n");
    code += `\n}`;
  }

  if (body) {
    code += `, json=${body}`;
  }

  code += `)\n\n`;
  code += `if response.ok:\n`;
  code += `    data = response.json()\n`;
  code += `    print(data)\n`;
  code += `else:\n`;
  code += `    print(f"Error: {response.status_code}")\n`;

  return code;
}

function generateJavaScript(method, url, headers, body) {
  let code = `// JavaScript (fetch)\n\n`;
  code += `const response = await fetch('${url}', {\n`;
  code += `  method: '${method}',\n`;

  const headerArray = Array.from(headers);
  if (headerArray.length > 0) {
    code += `  headers: {\n`;
    const items = headerArray.map((h) => {
      const [key, value] = h.replace('-H "', "").replace('"', "").split(": ");
      return `    '${key}': '${value}'`;
    });
    code += items.join(",\n");
    code += `\n  },\n`;
  }

  if (body) {
    code += `  body: JSON.stringify(${body}),\n`;
  }

  code += `});\n\n`;
  code += `if (response.ok) {\n`;
  code += `  const data = await response.json();\n`;
  code += `  console.log(data);\n`;
  code += `} else {\n`;
  code += `  console.error('Error:', response.status);\n`;
  code += `}\n`;

  return code;
}

/**
 * Create a handler for the /docs endpoint.
 *
 * This function returns a request handler that serves the API documentation
 * in JSON format. It uses the current request's host to build the base URL.
 *
 * @param {Object} routes - Processed routes.
 * @returns {Function} Request handler function (req, res) => void.
 *
 * @example
 * routes['/docs'] = {
 *   GET: createDocsHandler(routes)
 * };
 */
export const createDocsHandler = (routes) => {
  return ({ req }) => {
    const baseUrl = `http://${req.headers.host}`;
    return generateDocs(routes, baseUrl);
  };
};
