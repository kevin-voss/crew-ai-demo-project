const { parseJsonBody } = require('./parser.js');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Creates route handlers that use the given items service.
 * @param {Object} service - Items service with findAll, create, findById, update, remove
 * @returns {Object} Route handlers { listItems, createItem, getItem, updateItem, deleteItem }
 */
function createRoutes(service) {
  async function listItems(req, res) {
    const items = service.findAll();
    sendJson(res, 200, items);
  }

  async function createItem(req, res) {
    const body = await parseJsonBody(req);
    if (!body || typeof body !== 'object') {
      return sendJson(res, 400, { error: 'Invalid or missing JSON body' });
    }
    const item = service.create(body);
    sendJson(res, 201, item);
  }

  async function getItem(req, res) {
    const { id } = req.params || {};
    const item = service.findById(id);
    if (!item) return sendJson(res, 404, { error: 'Not found' });
    sendJson(res, 200, item);
  }

  async function updateItem(req, res) {
    const { id } = req.params || {};
    const body = await parseJsonBody(req);
    if (!body || typeof body !== 'object') {
      return sendJson(res, 400, { error: 'Invalid or missing JSON body' });
    }
    const item = service.update(id, body);
    if (!item) return sendJson(res, 404, { error: 'Not found' });
    sendJson(res, 200, item);
  }

  async function deleteItem(req, res) {
    const { id } = req.params || {};
    const ok = service.remove(id);
    if (!ok) return sendJson(res, 404, { error: 'Not found' });
    res.writeHead(204);
    res.end();
  }

  return { listItems, createItem, getItem, updateItem, deleteItem };
}

module.exports = { createRoutes };
