'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');
const { associateCurrentUser, restrictToOwner } = require('feathers-authentication-hooks');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.hooks.authenticate('jwt'),
    associateCurrentUser({ as: 'authorId' })
  ],
  update: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: 'authorId' })
  ],
  patch: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: 'authorId' })
  ],
  remove: [
    auth.hooks.authenticate('jwt'),
    restrictToOwner({ ownerField: 'authorId' })
  ]
};
exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
