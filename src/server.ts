import { ApolloServer } from 'apollo-server-express';
import { Http2Server } from 'http2';
import { createApp } from './app';
import { createContext } from './context';
import { createServer as createHttpServer } from 'http';
import express from 'express';
import path from 'path';
import { schema } from './schema';

const env = process.env.NODE_ENV;
const envPath = env === 'development'
  ? path.resolve(__dirname, '../dotenv/dev.env')
  : env === 'test'
    ? path.resolve(__dirname, '../dotenv/test.env')
    : path.resolve(__dirname, '../dotenv/.env');

require('dotenv').config({ path: envPath });

const { JWT_SECRET } = process.env;

export const APP_SECRET = JWT_SECRET;

const createApolloServer = (): ApolloServer => new ApolloServer({
  schema,
  context: createContext,
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
  subscriptions: {
    onConnect: (): void => {
      process.stdout.write('Connected to websocket\n');
    },
  },
});

const initializeApolloServer = (apollo: ApolloServer, app: express.Application): () => void => {
  apollo.applyMiddleware({ app });

  return (): void => {
    process.stdout.write(
      `🚀 Server ready at http://localhost:4000${apollo.graphqlPath}\n`,
    );
  };
};

export const startServer = async (app: express.Application): Promise<Http2Server> => {
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer();
  apollo.installSubscriptionHandlers(httpServer);
  const handleApolloServerInitilized = initializeApolloServer(apollo, app);

  return httpServer.listen({ port: 4000 }, () => {
    handleApolloServerInitilized();
  });
};

if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  startServer(app);
}
