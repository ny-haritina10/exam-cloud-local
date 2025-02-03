const { Timestamp } = require('firebase/firestore');

function convertValue(value) {
  if (value === null || value === undefined) return value;

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;

  return String(value);
}

module.exports = convertValue;