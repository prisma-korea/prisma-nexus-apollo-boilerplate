import 'cross-fetch/polyfill';

import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client/core';
import {TestUtils, getTestUtils, setTestUtils} from './testUtils';

import {GraphQLClient} from 'graphql-request';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import NodeWebSocket from 'ws';
import {PrismaClient} from '@prisma/client';
import {assert} from '../src/utils/assert';
import {createApp} from '../src/app';
import {createClient} from 'graphql-ws';
import {execSync} from 'child_process';
import type express from 'express';
import {getMainDefinition} from '@apollo/client/utilities';
import {startServer} from '../src/server';

// @ts-ignore
// global.Headers = global.Headers || Headers;

const {PORT = 5566, DATABASE_URL} = process.env;

export const testSubscriptionHost = `ws://localhost:${PORT}/graphql`;
export const testHost = `http://localhost:${PORT}/graphql`;

assert(DATABASE_URL, 'Missing DATABASE_URL test environment varialbe.');

beforeAll(async () => {
  const prisma = new PrismaClient();
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE');
  await prisma.$executeRawUnsafe('CREATE SCHEMA public');

  execSync('yarn db-push:test --accept-data-loss', {env: process.env});

  // Start server.
  const app: express.Application = createApp();
  const server = await startServer(app, PORT);

  // Instantiate graphql client.
  const graphqlClient = new GraphQLClient(testHost);

  const httpLink = new HttpLink({
    uri: testHost,
  });

  const networkInterface = createClient({
    url: testSubscriptionHost,
    webSocketImpl: NodeWebSocket,
  });

  const wsLink = new GraphQLWsLink(networkInterface);

  const splitLink = split(
    ({query}) => {
      const definition = getMainDefinition(query);

      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  setTestUtils(
    new TestUtils(
      apolloClient,
      server,
      prisma,
      graphqlClient,
      networkInterface,
    ),
  );
});

afterAll(async () => {
  const {server, prisma, networkInterface} = getTestUtils();

  // Close server.
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });

    networkInterface.dispose();
  });

  // Disconnect prisma client.
  await prisma.$disconnect();
});
