import { apollo, startServer } from '../../src/server';
import createPubSubClient, { PubSubClient } from './clientSetup';
import { Http2Server } from 'http2';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';
import { exec } from 'child_process';
import express from 'express';

const prisma = new PrismaClient();
const port = 5000;
let server: Http2Server;
export let pubSub: PubSubClient;
export const testHost = `http://localhost:${port}/graphql`;

beforeAll(async (done) => {
  const app: express.Application = createApp();
  server = await startServer(app);

  pubSub = createPubSubClient(
    server,
    apollo.subscriptionsPath,
  );

  exec('yarn migrate:test', (err): void => {
    if (err) throw new Error(err.message);
    done();
  });
});

afterAll(async () => {
  await prisma.raw('DROP schema test CASCADE');
  server.close();
});
