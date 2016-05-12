'use strict';

const hooks = require('./hooks');
import {apolloServer} from 'graphql-tools';
import Resolvers from  './resolvers';
import Schema from './schema';

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/graphql', apolloServer({
  graphiql: true,
  pretty: true,
  schema: Schema,
//   mocks: {},
  resolvers: Resolvers.call(app)
}));

};
