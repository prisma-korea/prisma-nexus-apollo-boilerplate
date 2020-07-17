import { PaginationType, prismaOffsetPagination } from '../../../utils/paginator';
import { intArg, queryField, stringArg } from '@nexus/schema';
import { User } from '../../models';
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
    whereArgs: stringArg(),
  },
  nullable: true,
  resolve(_parent, {
    currentPage,
    cursor,
    size,
    buttonNum,
    orderBy,
    orderDirection,
    whereArgs,
  }, ctx):Promise<PaginationType> {
    const result = prismaOffsetPagination({
      model: User,
      currentPage,
      cursor,
      size,
      buttonNum,
      orderBy,
      // @ts-ignore -> TODO : Change orderDirection as unionType
      orderDirection,
      whereArgs,
      IsWhereArgsString: true,
      prisma: ctx.prisma,
    });
    return result;
  },
});
