import type {Server} from 'http';
import {createServer as createHttpServer} from 'http';
import {createContext, runSubscriptionServer} from './context';

import {ApolloServer} from 'apollo-server-express';
import {ApolloServerPluginDrainHttpServer} from 'apollo-server-core';
import type {Disposable} from 'graphql-ws';
import {applyMiddleware} from 'graphql-middleware';
import {createApp} from './app';
import type express from 'express';
import {permissions} from './permissions';
import {schema} from './schema';

export const schemaWithMiddleware = applyMiddleware(schema, permissions);

const {NODE_ENV, PORT = 6001} = process.env;

let serverCleanup: Disposable;

const createApolloServer = (httpServer: Server): ApolloServer =>
  new ApolloServer({
    schema: schemaWithMiddleware,
    context: createContext,
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [
      ApolloServerPluginDrainHttpServer({httpServer}),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              serverCleanup?.dispose();
            },
          };
        },
      },
    ],
  });

const initializeApolloServer = (
  httpServer: Server,
  apollo: ApolloServer,
  app: express.Application,
  port: number,
): (() => void) => {
  apollo.applyMiddleware({app});
  serverCleanup = runSubscriptionServer(httpServer, apollo);

  return (): void => {
    process.stdout.write(
      `🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}\n`,
    );
  };
};

export const startServer = async (
  app: express.Application,
  port: number | string,
): Promise<Server> => {
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer(httpServer);

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

  startServer(app, PORT);
}
