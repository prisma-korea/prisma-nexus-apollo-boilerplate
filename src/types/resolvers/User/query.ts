import { FindManyUserArgs, UserDelegate, UserWhereInput } from '@prisma/client';
import { intArg, queryField, stringArg } from '@nexus/schema';
import { User } from '../../models';
import { createPageEdges } from '../../../utils/paginator';
import { getUserId } from '../../../utils';
import { paginationUserConnection as paginationConnection } from '../../../utils/connection';

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

interface PageEdgeType {
  cursor: string,
  node: typeof User,
}
interface PageCursorType {
  cursor: string,
  page: number,
  isCurrent: boolean,
}
interface PaginationType {
  pageEdges: [PageEdgeType],
  pageCursors: {
    previous: PageCursorType,
    first: PageCursorType,
    arounds: [PageCursorType],
    last: PageCursorType,
  }
}

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
  }, ctx):Promise<PaginationType> {
    let whereArgs: UserWhereInput = {};
    if (where) {
      const whereParsed = JSON.parse(where.replace(/'/g, '"'));
      whereArgs = { ...whereArgs, ...whereParsed };
    }

    const result = createPageEdges<FindManyUserArgs, UserWhereInput, UserDelegate>({
      model: User,
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
