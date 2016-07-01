'use strict';

const mongoose = require('mongoose');
const user = require('./user');
const post = require('./post');
const comment = require('./comment');
const viewer = require('./viewer');
const graphql = require('./graphql');
const authentication = require('./authentication');


module.exports = function() {
  const app = this;
  
  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = global.Promise;
  
  app.configure(authentication);
  app.configure(user);
  app.configure(post);
  app.configure(comment);
  app.configure(viewer);
  app.configure(graphql);
};
