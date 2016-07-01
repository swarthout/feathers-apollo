'use strict';

const hooks = require('./hooks');
import {apolloServer} from 'apollo-server';
import Resolvers from  './resolvers';
import Schema from './schema';

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/graphql', apolloServer((req) => {
    let {token, provider} = req.feathers;
    return {
      graphiql: true,
      pretty: true,
      schema: Schema,
      resolvers: Resolvers.call(app),
      context: {
        token,
        provider
      }
    }
  }));

};
