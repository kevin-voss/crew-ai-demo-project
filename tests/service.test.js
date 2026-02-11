// tests/service.test.js
const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert');
const { createItemsService } = require('../src/rest/service.js');
const { createMockItemsService } = require('../src/rest/mock-service.js');
const store = require('../src/rest/store.js');

describe('createItemsService (real)', () => {
  let service;

  before(() => {
    service = createItemsService(store);
  });

  beforeEach(() => {
    store.reset();
  });

  it('findAll returns empty array when store is empty', () => {
    const items = service.findAll();
    assert.deepStrictEqual(items, []);
  });

  it('create adds item and returns it with id', () => {
    const item = service.create({ name: 'Test' });
    assert.ok(item.id);
    assert.strictEqual(item.name, 'Test');
    assert.deepStrictEqual(service.findAll(), [item]);
  });

  it('findById returns item when found', () => {
    const created = service.create({ name: 'FindMe' });
    const found = service.findById(created.id);
    assert.strictEqual(found?.name, 'FindMe');
  });

  it('findById returns null when not found', () => {
    assert.strictEqual(service.findById('999'), null);
  });

  it('update modifies item and returns it', () => {
    const created = service.create({ name: 'Original' });
    const updated = service.update(created.id, { name: 'Updated' });
    assert.strictEqual(updated?.name, 'Updated');
  });

  it('update returns null when not found', () => {
    assert.strictEqual(service.update('999', { name: 'X' }), null);
  });

  it('remove returns true when item deleted', () => {
    const created = service.create({ name: 'ToDelete' });
    const ok = service.remove(created.id);
    assert.strictEqual(ok, true);
    assert.strictEqual(service.findById(created.id), null);
  });

  it('remove returns false when not found', () => {
    assert.strictEqual(service.remove('999'), false);
  });
});

describe('createMockItemsService (mock)', () => {
  it('findAll returns empty array by default', () => {
    const service = createMockItemsService();
    assert.deepStrictEqual(service.findAll(), []);
  });

  it('create adds item and returns it with id', () => {
    const service = createMockItemsService();
    const item = service.create({ name: 'Mock' });
    assert.ok(item.id);
    assert.strictEqual(item.name, 'Mock');
  });

  it('findById returns item when found', () => {
    const service = createMockItemsService();
    const created = service.create({ name: 'FindMe' });
    const found = service.findById(created.id);
    assert.strictEqual(found?.name, 'FindMe');
  });

  it('findById returns null when not found', () => {
    const service = createMockItemsService();
    assert.strictEqual(service.findById('999'), null);
  });

  it('update modifies item and returns it', () => {
    const service = createMockItemsService();
    const created = service.create({ name: 'Original' });
    const updated = service.update(created.id, { name: 'Updated' });
    assert.strictEqual(updated?.name, 'Updated');
  });

  it('update returns null when not found', () => {
    const service = createMockItemsService();
    assert.strictEqual(service.update('999', { name: 'X' }), null);
  });

  it('remove returns true when item deleted', () => {
    const service = createMockItemsService();
    const created = service.create({ name: 'ToDelete' });
    const ok = service.remove(created.id);
    assert.strictEqual(ok, true);
    assert.strictEqual(service.findById(created.id), null);
  });

  it('remove returns false when not found', () => {
    const service = createMockItemsService();
    assert.strictEqual(service.remove('999'), false);
  });

  it('initialItems pre-populates the mock', () => {
    const service = createMockItemsService({
      initialItems: [{ name: 'Pre' }]
    });
    const items = service.findAll();
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].name, 'Pre');
    assert.ok(items[0].id);
  });
});
