import { GraphQLUpload } from 'graphql-upload-minimal';
import { Resolvers } from '../generated/graphql';
import queries from './queries.js';
import mutations from './mutations.js';

export const resolvers: Resolvers = {
  Upload: GraphQLUpload,

  Query: {
    ...queries,
  },

  Mutation: {
    ...mutations,
  },
};
