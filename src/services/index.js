'use strict';


const user = require('./user');
const post = require('./post');
const comment = require('./comment');
const viewer = require('./viewer');
const graphql = require('./graphql');


module.exports = function() {
  const app = this;

  app.configure(user);
  app.configure(post);
  app.configure(comment);
  app.configure(viewer);
  app.configure(graphql);
};
