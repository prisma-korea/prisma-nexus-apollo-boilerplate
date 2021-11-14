import {TestUtils, getTestUtils, setTestUtils} from './testUtils';

import ApolloClient from 'apollo-client';
import {GraphQLClient} from 'graphql-request';
import {Headers} from 'cross-fetch';
import {InMemoryCache} from 'apollo-cache-inmemory';
import NodeWebSocket from 'ws';
import {PrismaClient} from '@prisma/client';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import {WebSocketLink} from 'apollo-link-ws';
import {assert} from '../src/utils/assert';
import {createApp} from '../src/app';
import {execSync} from 'child_process';
import express from 'express';
import path from 'path';
import {startServer} from '../src/server';

// @ts-ignore
global.Headers = global.Headers || Headers;

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

  const networkInterface = new SubscriptionClient(
    testSubscriptionHost,
    {reconnect: true},
    NodeWebSocket,
  );

  const apolloClient = new ApolloClient({
    link: new WebSocketLink(networkInterface),
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

    networkInterface.close();
  });

  // Disconnect prisma client.
  await prisma.$disconnect();
});
