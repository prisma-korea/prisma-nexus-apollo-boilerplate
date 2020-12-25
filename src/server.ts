import { createContext, prisma } from './context';

import { ApolloServer } from 'apollo-server-express';
import { Http2Server } from 'http2';
import { PrismaClient } from '@prisma/client';
import { applyMiddleware } from 'graphql-middleware';
import { createApp } from './app';
import { createServer as createHttpServer } from 'http';
import express from 'express';
import { permissions } from './permissions';
import { schema } from './schema';

const { PORT = 5000, NODE_ENV } = process.env;

const schemaWithMiddleware = applyMiddleware(
  schema,
  permissions,
);

const createApolloServer = (prisma: PrismaClient): ApolloServer => new ApolloServer({
  schema: schemaWithMiddleware,
  context: (req) => createContext(prisma, req),
  introspection: NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
  subscriptions: {
    onConnect: (): void => {
      process.stdout.write('Connected to websocket\n');
    },
  },
});

const initializeApolloServer = (
  apollo: ApolloServer,
  app: express.Application,
  port: string | number,
): () => void => {
  apollo.applyMiddleware({ app });

  return (): void => {
    if (process.env.NODE_ENV !== 'test') {
      process.stdout.write(
        `🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}\n`,
      );
    }
  };
};

export const startServer = async (
  app: express.Application,
  port: string | number,
): Promise<Http2Server> => {
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer(prisma);
  const handleApolloServerInitilized = initializeApolloServer(apollo, app, port);

  apollo.installSubscriptionHandlers(httpServer);

  // Disconnect prisma client on server close.
  httpServer.addListener('close', () => prisma.$disconnect());

  return new Promise((resolve) => {
    httpServer.listen({ port }, () => {
      handleApolloServerInitilized();
      resolve(httpServer);
    });
  });
};

if (NODE_ENV !== 'test') {
  const app = createApp();

  startServer(app, PORT);
}
