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
  app.use('/authors', service(options));

  const authorService = app.service('/authors');

// Set up our before hooks
  authorService.before(hooks.before);

// Set up our after hooks
  authorService.after(hooks.after);

};
