'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve(params.user);
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/viewer', new Service());

  // Get our initialize service to that we can bind hooks
  const viewerService = app.service('/viewer');

  // Set up our before hooks
  viewerService.before(hooks.before);

  // Set up our after hooks
  viewerService.after(hooks.after);
};

module.exports.Service = Service;
