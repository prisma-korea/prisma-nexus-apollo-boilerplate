import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import express from 'express';
import { getUserId } from './utils/auth';

const prisma = new PrismaClient();
const { JWT_SECRET } = process.env;

export interface Context {
  request: {
    req: express.Request,
  };
  prisma: PrismaClient;
  pubsub: PubSub;
  appSecret: string;
  userId: string;
}

const pubsub = new PubSub();

export function createContext(request: { req: express.Request }): Context {
  return {
    request,
    prisma,
    pubsub,
    appSecret: JWT_SECRET,
    userId: getUserId(request),
  };
}

prisma.$use(async (params, next) => {
  const softDeletionModels = [
    'User',
  ];

  if (softDeletionModels.includes(params.model)) {
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date().toISOString() };
    }
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data.deletedAt = new Date().toISOString();
      } else {
        params.args.data = { deletedAt: new Date().toISOString() };
      }
    }
  }
  return next(params);
});
