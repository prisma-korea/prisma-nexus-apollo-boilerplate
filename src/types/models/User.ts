import { FindManyPostArgs, PostDelegate, PostWhereInput } from '@prisma/client';
import { intArg, objectType, stringArg } from '@nexus/schema';
import { Post } from './Post';
import { createPageEdges } from '../../utils/paginator';
import { getUserId } from '../../utils';
import { paginationPostConnection as paginationConnection } from '../../utils/connection';

export const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.model.id();
    t.model.socialId();
    t.model.authType();
  },
});

interface PageEdgeType {
  cursor: string,
  node: typeof Post,
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

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.email();
    t.model.name();
    t.model.nickname();
    t.model.thumbURL();
    t.model.photoURL();
    t.model.birthDay();
    t.model.gender();
    t.model.phone();
    t.model.verified();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.deletedAt();
    t.model.profile();
    t.field('posts', {
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
      async resolve(_parent, {
        currentPage,
        cursor,
        size,
        buttonNum,
        orderBy,
        orderDirection,
        where,
      }, ctx):Promise<PaginationType> {
        const userId = getUserId(ctx);

        let whereArgs: PostWhereInput = {
          user: {
            id: userId,
          },
        };
        if (where) {
          const whereParsed = JSON.parse(where.replace(/'/g, '"'));
          whereArgs = { ...whereArgs, ...whereParsed };
        }

        const result = await createPageEdges<FindManyPostArgs, PostWhereInput, PostDelegate>({
          model: Post,
          currentPage,
          cursor,
          size,
          buttonNum,
          orderBy,
          // @ts-ignore -> TODO : Change orderDirection as unionType
          orderDirection,
          whereArgs,
          prismaModel: ctx.prisma.post,
        });
        return result;
      },
    });
  },
});
