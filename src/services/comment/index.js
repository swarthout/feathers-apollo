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
  app.use('/comments', service(options));

  const commentService = app.service('/comments');

// Set up our before hooks
  commentService.before(hooks.before);

// Set up our after hooks
  commentService.after(hooks.after);

};
