const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');

const { server } = require('../src/server.js');

function makeRequest(port, path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function startServer(port) {
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server.address().port));
  });
}

function stopServer() {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

describe('Simple Server', () => {
  it('GET / returns 200 and welcome message', async () => {
    const port = await startServer(0);
    try {
      const { statusCode, body } = await makeRequest(port, '/');
      assert.strictEqual(statusCode, 200);
      assert.ok(body.includes('Welcome to the simple server!'));
    } finally {
      await stopServer();
    }
  });

  it('GET /health returns 200 and status ok', async () => {
    const port = await startServer(0);
    try {
      const { statusCode, body } = await makeRequest(port, '/health');
      assert.strictEqual(statusCode, 200);
      const json = JSON.parse(body);
      assert.strictEqual(json.status, 'ok');
    } finally {
      await stopServer();
    }
  });

  it('Server uses PORT env', async () => {
    const testPort = 34567;
    const originalPort = process.env.PORT;
    process.env.PORT = String(testPort);
    delete require.cache[require.resolve('../src/server.js')];
    const { server: testServer, PORT } = require('../src/server.js');
    process.env.PORT = originalPort;

    try {
      await new Promise((resolve) => {
        testServer.listen(PORT, () => resolve());
      });
      const address = testServer.address();
      assert.strictEqual(address.port, testPort);
    } finally {
      await new Promise((resolve) => testServer.close(() => resolve()));
    }
  });
});
