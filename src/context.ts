import {PrismaClient} from '@prisma/client';
import {PubSub} from 'graphql-subscriptions';
import {assert} from './utils/assert';
import express from 'express';
import {getUserId} from './utils/auth';

const {JWT_SECRET} = process.env;

export interface Context {
  request: {req: ReqI18n};
  prisma: PrismaClient;
  pubsub: PubSub;
  appSecret: string;
  userId: string | null;
}

const pubsub = new PubSub();

const createPrismaClient = (): PrismaClient => {
  const prisma = new PrismaClient();

  //! Specify soft deletion models here.
  // prisma.$use(async (params, next) => {
  //   const softDeletionModels = [
  //   ];

  //   if (params.model && softDeletionModels.includes(params.model)) {
  //     if (params.action === 'delete') {
  //       params.action = 'update';
  //       params.args.data = { deletedAt: new Date().toISOString() };
  //     }

  //     if (params.action === 'deleteMany') {
  //       params.action = 'updateMany';

  //       if (params.args.data !== undefined) {
  //         params.args.data.deletedAt = new Date().toISOString();
  //       } else {
  //         params.args.data = { deletedAt: new Date().toISOString() };
  //       }
  //     }
  //   }

  //   return next(params);
  // });

  return prisma;
};

export const prisma = createPrismaClient();

type CreateContextParams = {
  req: express.Request;
  res: express.Response;
  connection?: unknown;
};

export function createContext(params: CreateContextParams): Context {
  const {req, connection} = params;

  const authorization =
    !req || !req.headers
      ? (connection as any)?.context?.connectionParams?.Authorization // for subscriptions.
      : req.get('Authorization'); // for queries & mutations.

  assert(JWT_SECRET, 'Missing JWT_SECRET environment variable');

  return {
    request: params,
    prisma,
    pubsub,
    appSecret: JWT_SECRET,
    userId: getUserId(authorization),
  };
}
