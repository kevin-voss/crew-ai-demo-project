const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

const { server } = require('../src/server.js');
const store = require('../src/rest/store.js');

function makeRequest(port, path, options = {}) {
  return new Promise((resolve, reject) => {
    const { method = 'GET', body } = options;
    const url = new URL(path, `http://localhost:${port}`);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function startServer(port) {
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server.address().port));
  });
}

function stopServer() {
  return new Promise((resolve) => server.close(() => resolve()));
}

describe('REST API /api/items', () => {
  let port;
  before(async () => {
    store.reset();
    port = await startServer(0);
  });
  after(() => stopServer());

  it('GET /api/items returns 200 and empty array when no items', async () => {
    const { statusCode, body } = await makeRequest(port, '/api/items');
    assert.strictEqual(statusCode, 200);
    assert.deepStrictEqual(JSON.parse(body), []);
  });

  it('POST /api/items with valid JSON returns 201 and created item with id', async () => {
    const { statusCode, body } = await makeRequest(port, '/api/items', {
      method: 'POST',
      body: { name: 'Widget' }
    });
    assert.strictEqual(statusCode, 201);
    const item = JSON.parse(body);
    assert.ok(item.id);
    assert.strictEqual(item.name, 'Widget');
  });

  it('GET /api/items/:id returns 200 and item when found', async () => {
    const create = await makeRequest(port, '/api/items', {
      method: 'POST',
      body: { name: 'Test' }
    });
    const item = JSON.parse(create.body);
    const { statusCode, body } = await makeRequest(port, `/api/items/${item.id}`);
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(JSON.parse(body).name, 'Test');
  });

  it('GET /api/items/:id returns 404 when not found', async () => {
    const { statusCode } = await makeRequest(port, '/api/items/999');
    assert.strictEqual(statusCode, 404);
  });

  it('PUT /api/items/:id returns 200 and updated item when found', async () => {
    const create = await makeRequest(port, '/api/items', {
      method: 'POST',
      body: { name: 'Original' }
    });
    const created = JSON.parse(create.body);
    const { statusCode, body } = await makeRequest(port, `/api/items/${created.id}`, {
      method: 'PUT',
      body: { name: 'Updated' }
    });
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(JSON.parse(body).name, 'Updated');
  });

  it('PUT /api/items/:id returns 404 when not found', async () => {
    const { statusCode } = await makeRequest(port, '/api/items/999', {
      method: 'PUT',
      body: { name: 'Updated' }
    });
    assert.strictEqual(statusCode, 404);
  });

  it('DELETE /api/items/:id returns 204 when found', async () => {
    const create = await makeRequest(port, '/api/items', {
      method: 'POST',
      body: { name: 'ToDelete' }
    });
    const item = JSON.parse(create.body);
    const { statusCode, body } = await makeRequest(port, `/api/items/${item.id}`, {
      method: 'DELETE'
    });
    assert.strictEqual(statusCode, 204);
    assert.strictEqual(body, '');
  });

  it('DELETE /api/items/:id returns 404 when not found', async () => {
    const { statusCode } = await makeRequest(port, '/api/items/999', {
      method: 'DELETE'
    });
    assert.strictEqual(statusCode, 404);
  });

  it('POST /api/items with invalid JSON returns 400', async () => {
    const { statusCode } = await makeRequest(port, '/api/items', {
      method: 'POST',
      body: 'not json'
    });
    assert.strictEqual(statusCode, 400);
  });

  it('Unmatched /api/* path returns 404', async () => {
    const { statusCode } = await makeRequest(port, '/api/unknown');
    assert.strictEqual(statusCode, 404);
  });
});
