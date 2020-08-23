import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import express from 'express';

const prisma = new PrismaClient();
const { JWT_SECRET } = process.env;

export interface Context {
  request: {
    req: express.Request,
  };
  prisma: PrismaClient;
  pubsub: PubSub;
  appSecret: string;
}

const pubsub = new PubSub();

export function createContext(request: { req: express.Request }): Context {
  return {
    request,
    prisma,
    pubsub,
    appSecret: JWT_SECRET,
  };
}
