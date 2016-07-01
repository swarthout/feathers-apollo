'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('viewer service', function() {
  it('registered the viewers service', () => {
    assert.ok(app.service('viewers'));
  });
});
