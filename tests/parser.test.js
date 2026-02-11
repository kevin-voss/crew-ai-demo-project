const { describe, it } = require('node:test');
const assert = require('node:assert');
const { Readable } = require('stream');
const { parseJsonBody } = require('../src/rest/parser.js');

function createMockRequest(headers = {}, body = '') {
  const req = new Readable({
    read() {},
  });
  req.headers = headers;
  req.method = 'POST';
  req.url = '/';
  if (body !== undefined) {
    process.nextTick(() => {
      req.push(body);
      req.push(null);
    });
  }
  return req;
}

describe('parseJsonBody', () => {
  it('parses valid JSON body', async () => {
    const body = JSON.stringify({ name: 'test', value: 42 });
    const req = createMockRequest({ 'content-type': 'application/json' }, body);
    const result = await parseJsonBody(req);
    assert.deepStrictEqual(result, { name: 'test', value: 42 });
  });

  it('returns null for empty body', async () => {
    const req = createMockRequest({ 'content-type': 'application/json' }, '');
    const result = await parseJsonBody(req);
    assert.strictEqual(result, null);
  });

  it('returns null for non-JSON Content-Type', async () => {
    const req = createMockRequest(
      { 'content-type': 'text/plain' },
      '{"foo":"bar"}'
    );
    const result = await parseJsonBody(req);
    assert.strictEqual(result, null);
  });

  it('returns null for missing Content-Type', async () => {
    const req = createMockRequest({}, '{"foo":"bar"}');
    const result = await parseJsonBody(req);
    assert.strictEqual(result, null);
  });

  it('returns null for invalid JSON', async () => {
    const req = createMockRequest(
      { 'content-type': 'application/json' },
      'not valid json'
    );
    const result = await parseJsonBody(req);
    assert.strictEqual(result, null);
  });

  it('collects chunks and parses once complete', async () => {
    const req = new Readable({
      read() {},
    });
    req.headers = { 'content-type': 'application/json' };
    req.method = 'POST';
    req.url = '/';

    const parsePromise = parseJsonBody(req);
    process.nextTick(() => {
      req.push('{"a":');
      req.push('1}');
      req.push(null);
    });

    const result = await parsePromise;
    assert.deepStrictEqual(result, { a: 1 });
  });
});
