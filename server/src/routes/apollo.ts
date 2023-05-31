import { PrismaClient } from '@prisma/client';
import { schema } from './graphql/schema.js';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
export interface Context {
  prisma: PrismaClient;
}

export const getGqlServer = async (httpServer: http.Server) => {
  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });
  await server.start();
  console.log('Apollo server initialized');

  return server;
};
