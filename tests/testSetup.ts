import { Http2Server } from 'http2';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';
import express from 'express';
import { startServer } from '../src/server';

const prisma = new PrismaClient();
const port = 5000;
let server: Http2Server;
export const testHost = `http://localhost:${port}/graphql`;

beforeAll(async (done) => {
  const app: express.Application = createApp();
  server = await startServer(app);
  done();
});

afterAll(async () => {
  await prisma.raw('DROP schema test CASCADE');
  server.close();
});
