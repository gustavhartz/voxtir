import { Resolvers } from '../generated/graphql';
import mutations from './mutations.js';
import queries from './queries.js';

export const resolvers: Resolvers = {
  Query: {
    ...queries,
  },

  Mutation: {
    ...mutations,
  },
};
