'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('author service', function() {
  it('registered the authors service', () => {
    assert.ok(app.service('authors'));
  });
});
