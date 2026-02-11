// src/rest/mock-service.js

/**
 * Creates a mock items service for testing.
 * Implements the same interface as createItemsService.
 * @param {Object} options - Optional { initialItems: Array }
 * @returns {Object} Mock service with findAll, create, findById, update, remove
 */
function createMockItemsService(options = {}) {
  const { initialItems = [] } = options;
  let items = initialItems.map((item, i) => ({
    id: String(i + 1),
    ...item
  }));
  let nextId = items.length + 1;

  return {
    findAll() {
      return [...items];
    },

    create(data) {
      const newItem = { id: String(nextId++), ...data };
      items.push(newItem);
      return newItem;
    },

    findById(id) {
      return items.find(item => item.id === id) ?? null;
    },

    update(id, data) {
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...data, id };
      return items[index];
    },

    remove(id) {
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return false;
      items.splice(index, 1);
      return true;
    }
  };
}

module.exports = { createMockItemsService };
