const { parse } = require('url');

function pathToRegex(path) {
  const pattern = path.replace(/:(\w+)/g, '([^/]+)');
  return new RegExp(`^${pattern}$`);
}

function extractParams(pathPattern, match) {
  const names = [...pathPattern.matchAll(/:(\w+)/g)].map((m) => m[1]);
  const params = {};
  names.forEach((name, i) => {
    params[name] = match[i + 1];
  });
  return params;
}

function createRouter() {
  const routes = [];

  function register(method, pathPattern, handler) {
    const regex = pathToRegex(pathPattern);
    routes.push({ method, pathPattern, regex, handler });
  }

  function route(req, res, fallback) {
    const { pathname } = parse(req.url, true);
    const method = req.method;

    for (const { method: m, pathPattern, regex, handler } of routes) {
      if (m !== method) continue;
      const match = pathname.match(regex);
      if (match) {
        req.params = extractParams(pathPattern, match);
        return handler(req, res);
      }
    }
    return fallback(req, res);
  }

  return { register, route };
}

module.exports = { createRouter };
