import {Server, createServer as createHttpServer} from 'http';
import {createContext, prisma, pubsub} from './context';
import {execute, subscribe} from 'graphql';

import {ApolloServer} from 'apollo-server-express';
import {SubscriptionServer} from 'subscriptions-transport-ws';
import {applyMiddleware} from 'graphql-middleware';
import {createApp} from './app';
import express from 'express';
import {getUserId} from './utils/auth';
import {permissions} from './permissions';
import {schema} from './schema';

const {NODE_ENV, JWT_SECRET} = process.env;

const schemaWithMiddleware = applyMiddleware(schema, permissions);

const createApolloServer = (): ApolloServer =>
  new ApolloServer({
    schema: schemaWithMiddleware,
    context: createContext,
    introspection: process.env.NODE_ENV !== 'production',
  });

const initializeApolloServer = (
  httpServer: Server,
  apollo: ApolloServer,
  app: express.Application,
  port: number = 5018,
): (() => void) => {
  apollo.applyMiddleware({app});

  const subscriptionServer = SubscriptionServer.create(
    {
      schema: schemaWithMiddleware,
      execute,
      subscribe,
      onConnect: async (connectionParams, _webSocket, _context) => {
        process.stdout.write('Connected to websocket\n');

        // Return connection parameters for context building.
        return {
          appSecret: JWT_SECRET,
          connectionParams,
          prisma,
          userId: getUserId(connectionParams?.Authorization),
          pubsub,
        };
      },
    },
    {
      server: httpServer,
      path: apollo.graphqlPath,
    },
  );

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => subscriptionServer.close());
  });

  return (): void => {
    process.stdout.write(
      `🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}\n`,
    );
  };
};

export const startServer = async (
  app: express.Application,
  port: number | string = 5018,
): Promise<Server> => {
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer();

  await apollo.start();

  const handleApolloServerInit = initializeApolloServer(
    httpServer,
    apollo,
    app,
    port as number,
  );

  return httpServer.listen({port}, () => {
    handleApolloServerInit();
  });
};

if (NODE_ENV !== 'test') {
  const app = createApp();

  startServer(app);
}
