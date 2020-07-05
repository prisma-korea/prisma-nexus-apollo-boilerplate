import { FindManyUserArgs, UserDelegate, UserWhereInput } from '@prisma/client';
import { intArg, queryField, stringArg } from '@nexus/schema';
import { createPageEdges } from '../../../utils/pageEdge';
import { getUserId } from '../../../utils';
import { paginationConnection } from '../../../utils/pageConnection';

export const me = queryField('me', {
  type: 'User',
  nullable: true,
  resolve: (parent, args, ctx) => {
    const userId = getUserId(ctx);
    return ctx.prisma.user.findOne({
      where: {
        id: userId,
      },
    });
  },
});

export const users = queryField('users', {
  type: paginationConnection,
  args: {
    currentPage: intArg(),
    cursor: stringArg(),
    size: intArg(),
    buttonNum: intArg(),
    orderBy: stringArg(),
    orderDirection: stringArg({
      default: 'desc',
    }),
    where: stringArg(),
  },
  nullable: true,
  resolve(_parent, {
    currentPage,
    cursor,
    size,
    buttonNum,
    orderBy,
    orderDirection,
    where,
  }, ctx):Promise<any> {
    let whereArgs: UserWhereInput = {};
    if (where) {
      const whereParsed = JSON.parse(where.replace(/'/g, '"'));
      whereArgs = { ...whereArgs, ...whereParsed };
    }

    const result = createPageEdges<FindManyUserArgs, UserDelegate, UserWhereInput>({
      modelType: 'user',
      currentPage,
      cursor,
      size,
      buttonNum,
      orderBy,
      // @ts-ignore -> TODO : Change orderDirection as unionType
      orderDirection,
      whereArgs,
      prismaModel: ctx.prisma.user,
    });
    return result;
  },
});
