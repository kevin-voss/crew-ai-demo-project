// src/rest/service.js

/**
 * Creates an items service that delegates to the given store.
 * @param {Object} store - Store with create, findAll, findById, update, remove
 * @returns {Object} Items service with findAll, create, findById, update, remove
 */
function createItemsService(store) {
  return {
    findAll() {
      return store.findAll();
    },

    create(data) {
      return store.create(data);
    },

    findById(id) {
      return store.findById(id);
    },

    update(id, data) {
      return store.update(id, data);
    },

    remove(id) {
      return store.remove(id);
    }
  };
}

module.exports = { createItemsService };
