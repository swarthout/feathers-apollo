'use strict';

const service = require('feathers-memory');
const hooks = require('./hooks');

module.exports = function () {
  const app = this;
  let options = {
    // paginate: {
    //   default: 5,
    //   max: 25
    // }
  };

// Initialize our service with any options it requires
  app.use('/posts', service(options));

  const postService = app.service('/posts');

// Set up our before hooks
  postService.before(hooks.before);

// Set up our after hooks
  postService.after(hooks.after);

};


