import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';

import { NODE_ENV } from '../../common/env.js';
import { logger } from '../../services/logger.js';
import { Context } from './context.js';
import { schema } from './schema.js';

export const getGqlServer = async (
  httpServer: http.Server
): Promise<ApolloServer<Context>> => {
  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: NODE_ENV === 'production',
  });
  // Disable the landing page in production
  if (NODE_ENV === 'production') {
    server.addPlugin(ApolloServerPluginLandingPageDisabled());
  }

  await server.start();
  logger.info('Apollo server initialized');

  return server;
};
