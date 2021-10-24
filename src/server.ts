import {Server, createServer as createHttpServer} from 'http';
import {createContext, runSubscriptionServer} from './context';

import {ApolloServer} from 'apollo-server-express';
import {applyMiddleware} from 'graphql-middleware';
import {createApp} from './app';
import express from 'express';
import {permissions} from './permissions';
import {schema} from './schema';

const {NODE_ENV, PORT = 6000} = process.env;

export const schemaWithMiddleware = applyMiddleware(schema, permissions);

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
  port: number,
): (() => void) => {
  apollo.applyMiddleware({app});

  runSubscriptionServer(httpServer, apollo);

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

  startServer(app, PORT);
}
