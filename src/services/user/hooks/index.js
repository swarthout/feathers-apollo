'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');
const { restrictToOwner } = require('feathers-authentication-hooks');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    local.hooks.hashPassword()
  ],
  update: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: '_id' })
  ],
  patch: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: '_id' })
  ],
  remove: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: '_id' })
  ]
};

exports.after = {
  all: [hooks.remove('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
