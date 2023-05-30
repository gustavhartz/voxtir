import { Resolvers } from '../generated/graphql';
import { Context } from '../context.js';

export const resolvers: Resolvers = {
  Query: {
    // Quickbooks endpoints
    getUrl: async (parent, args, context: Context, info) => {
      return 'https://google.com';
    },
  },
};
