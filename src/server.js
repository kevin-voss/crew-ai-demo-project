const http = require('http');
const { createRouter } = require('./rest/router.js');
const { createRoutes } = require('./rest/routes.js');
const store = require('./rest/store.js');
const { createItemsService } = require('./rest/service.js');

const PORT = process.env.PORT || 3000;

const service = createItemsService(store);
const routes = createRoutes(service);

const router = createRouter();
router.register('GET', '/api/items', routes.listItems);
router.register('POST', '/api/items', routes.createItem);
router.register('GET', '/api/items/:id', routes.getItem);
router.register('PUT', '/api/items/:id', routes.updateItem);
router.register('DELETE', '/api/items/:id', routes.deleteItem);

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to the simple server!');
    return;
  }
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  if (req.url.startsWith('/api/')) {
    router.route(req, res, () => send404(res));
    return;
  }
  res.writeHead(404);
  res.end('Not Found');
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = { server, PORT };
