import { GraphQLUpload } from 'graphql-upload-minimal';

import { Resolvers } from '../generated/graphql';
import mutations from './mutations.js';
import queries from './queries.js';

export const resolvers: Resolvers = {
  Upload: GraphQLUpload,

  Query: {
    ...queries,
  },

  Mutation: {
    ...mutations,
  },
};
