let items = [];
let nextId = 1;

function create(item) {
  const newItem = { id: String(nextId++), ...item };
  items.push(newItem);
  return newItem;
}

function findAll() {
  return [...items];
}

function findById(id) {
  return items.find(item => item.id === id) ?? null;
}

function update(id, data) {
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...data, id };
  return items[index];
}

function remove(id) {
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}

function reset() {
  items = [];
  nextId = 1;
}

module.exports = { create, findAll, findById, update, remove, reset };
