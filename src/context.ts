import type {ApolloServer} from 'apollo-server-express';
import type {Disposable} from 'graphql-ws';
import {PrismaClient} from '@prisma/client';
import {PubSub} from 'graphql-subscriptions';
import type {Server} from 'http';
import {WebSocketServer} from 'ws';
import {assert} from './utils/assert';
import type express from 'express';
import {getUserId} from './utils/auth';
import {schemaWithMiddleware} from './server';
import {useServer} from 'graphql-ws/lib/use/ws';

const {JWT_SECRET, NODE_ENV} = process.env;

export interface Context {
  request: {req: ReqI18n};
  prisma: PrismaClient;
  pubsub: PubSub;
  appSecret: string;
  userId: string | null;
}

export const pubsub = new PubSub();

const createPrismaClient = (): PrismaClient => {
  const prisma = new PrismaClient();

  //! Specify soft deletion models here.
  prisma.$use(async (params, next) => {
    const softDeletionModels = ['User', 'Post'];

    if (params.model && softDeletionModels.includes(params.model)) {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = {deletedAt: new Date().toISOString()};
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';

        if (params.args.data !== undefined) {
          params.args.data.deletedAt = new Date().toISOString();
        } else {
          params.args.data = {deletedAt: new Date().toISOString()};
        }
      }

      if (params.action === 'findUnique') {
        params.action = 'findFirst';
        params.args.where.deletedAt = null;
      }

      if (params.action === 'findMany' || params.action === 'findFirst') {
        if (params.args.where !== undefined) {
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        } else {
          params.args.where = {deletedAt: null};
        }
      }
    }

    return next(params);
  });

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

export const runSubscriptionServer = (
  httpServer: Server,
  apollo: ApolloServer,
): Disposable => {
  const subscriptionServer = new WebSocketServer({
    server: httpServer,
    path: apollo.graphqlPath,
  });

  const serverCleanup = useServer(
    {
      schema: schemaWithMiddleware,
      context: async (ctx) => {
        process.stdout.write('Connected to websocket\n');

        // Return connection parameters for context building.
        return {
          connectionParams: ctx.connectionParams,
          prisma,
          pubsub,
          appSecret: JWT_SECRET,
          userId: getUserId(
            // @ts-ignore
            ctx.connectionParams?.Authorization ||
              ctx.connectionParams?.authorization,
          ),
        };
      },
    },
    subscriptionServer,
  );

  if (NODE_ENV === 'production') {
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => subscriptionServer.close());
    });
  }

  return serverCleanup;
};
