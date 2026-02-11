const { parseJsonBody } = require('./parser.js');
const store = require('./store.js');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function listItems(req, res) {
  const items = store.findAll();
  sendJson(res, 200, items);
}

async function createItem(req, res) {
  const body = await parseJsonBody(req);
  if (!body || typeof body !== 'object') {
    return sendJson(res, 400, { error: 'Invalid or missing JSON body' });
  }
  const item = store.create(body);
  sendJson(res, 201, item);
}

async function getItem(req, res) {
  const { id } = req.params || {};
  const item = store.findById(id);
  if (!item) return sendJson(res, 404, { error: 'Not found' });
  sendJson(res, 200, item);
}

async function updateItem(req, res) {
  const { id } = req.params || {};
  const body = await parseJsonBody(req);
  if (!body || typeof body !== 'object') {
    return sendJson(res, 400, { error: 'Invalid or missing JSON body' });
  }
  const item = store.update(id, body);
  if (!item) return sendJson(res, 404, { error: 'Not found' });
  sendJson(res, 200, item);
}

async function deleteItem(req, res) {
  const { id } = req.params || {};
  const ok = store.remove(id);
  if (!ok) return sendJson(res, 404, { error: 'Not found' });
  res.writeHead(204);
  res.end();
}

module.exports = { listItems, createItem, getItem, updateItem, deleteItem };
