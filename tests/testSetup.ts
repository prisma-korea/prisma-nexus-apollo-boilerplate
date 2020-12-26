import { TestUtils, getTestUtils, setTestUtils } from './testUtils';

import ApolloClient from 'apollo-client';
import { GraphQLClient } from 'graphql-request';
import { Headers } from 'cross-fetch';
import { InMemoryCache } from 'apollo-cache-inmemory';
import NodeWebSocket from 'ws';
import { PrismaClient } from '@prisma/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from 'apollo-link-ws';
import { assert } from '../src/utils/assert';
import { createApp } from '../src/app';
import { execSync } from 'child_process';
import express from 'express';
import path from 'path';
import { startServer } from '../src/server';

// @ts-ignore
global.Headers = global.Headers || Headers;

jest.setTimeout(30000);

const { PORT = 5566, DATABASE_URL } = process.env;

export const testSubscriptionHost = `ws://localhost:${PORT}/graphql`;
export const testHost = `http://localhost:${PORT}/graphql`;

assert(DATABASE_URL, 'Missing DATABASE_URL test environment varialbe.');

function getSchemaName(dbUrl: string): string {
  const ret = new URL(dbUrl).searchParams.get('schema');

  assert(ret, 'Missing schema name in test environment variable.');

  return ret;
}

const SCHEMA = getSchemaName(DATABASE_URL);

beforeAll(async () => {
  const prisma = new PrismaClient();

  // Create test schema.
  await prisma.$executeRaw(`DROP SCHEMA IF EXISTS "${SCHEMA}" CASCADE`);
  await prisma.$executeRaw(`CREATE SCHEMA "${SCHEMA}"`);

  // Migrate test database.
  const prismaBinary = path.join(__dirname, '../node_modules/.bin/prisma');

  execSync(
    `${prismaBinary} db push --preview-feature`,
    { env: process.env },
  );

  // Start server.
  const app: express.Application = createApp();
  const server = await startServer(app, PORT);

  // Instantiate graphql client.
  const graphqlClient = new GraphQLClient(testHost);

  const networkInterface = new SubscriptionClient(
    testSubscriptionHost,
    { reconnect: true },
    NodeWebSocket,
  );

  const apolloClient = new ApolloClient({
    link: new WebSocketLink(networkInterface),
    cache: new InMemoryCache(),
  });

  setTestUtils(new TestUtils(
    apolloClient,
    server,
    prisma,
    graphqlClient,
    networkInterface,
  ));
});

afterAll(async () => {
  const { server, prisma, networkInterface } = getTestUtils();

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

  // Drop test schema.
  await prisma.$executeRaw(`DROP SCHEMA "${SCHEMA}" CASCADE`);

  // Disconnect prisma client.
  await prisma.$disconnect();
});
