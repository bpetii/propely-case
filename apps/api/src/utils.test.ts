import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTaskFilters } from './utils.js';

test('preserves combined filters and normalizes Norwegian search text', () => {
  assert.deepEqual(validateTaskFilters({
    status: 'Rejected',
    category: 'Electrical',
    property_id: 'prop-011',
    search: '  ÅKERVEIEN 3  ',
  }), {
    valid: true,
    filters: {
      status: 'Rejected',
      category: 'Electrical',
      property_id: 'prop-011',
      search: 'åkerveien 3',
    },
  });
});

test('rejects invalid enum values and non-string query parameters', () => {
  assert.deepEqual(validateTaskFilters({ status: 'Unknown' }), {
    valid: false, error: 'Invalid status.',
  });
  assert.deepEqual(validateTaskFilters({ category: 'Unknown' }), {
    valid: false, error: 'Invalid category.',
  });
  for (const field of ['status', 'category', 'property_id', 'search']) {
    for (const value of [['New', 'Completed'], { nested: 'value' }]) {
      assert.deepEqual(validateTaskFilters({ [field]: value }), {
        valid: false, error: 'Filters must be single strings.',
      }, `${field} must reject arrays and objects`);
    }
  }
});
