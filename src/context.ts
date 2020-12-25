import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { assert } from './utils/assert';
import { getUserId } from './utils/auth';

export interface Context {
  request: { req: ReqI18n };
  prisma: PrismaClient;
  pubsub: PubSub;
  appSecret: string;
  userId: string;
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

export function createContext(prisma: PrismaClient, request: { req: ReqI18n }): Context {
  const { JWT_SECRET } = process.env;

  assert(JWT_SECRET, 'Missing JWT_SECRET environment variable');

  return {
    request,
    prisma,
    pubsub,
    appSecret: JWT_SECRET,
    userId: getUserId(request),
  };
}
