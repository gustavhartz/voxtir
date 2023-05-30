import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers/index.js';
import { typeDefs } from './typedefs/typedefs.js';
// fs for writing files

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
