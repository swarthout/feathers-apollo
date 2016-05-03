const app =require('./app');
import Resolvers from  './graphql/resolvers';
import Schema from './graphql/schema';
import {apolloServer} from 'graphql-tools';

app.use('/graphql',apolloServer({
  graphiql: true,
  pretty: true,
  schema: Schema,
  // mocks: {},
  resolvers: Resolvers
}));

module.exports = app;
