import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import { Context } from './graphql/context.js';
import { schema } from './graphql/schema.js';

export const getGqlServer = async (
  httpServer: http.Server
): Promise<ApolloServer<Context>> => {
  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });
  await server.start();
  console.log('Apollo server initialized');

  return server;
};
