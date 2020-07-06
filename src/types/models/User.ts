import { FindManyPostArgs, PostDelegate, PostWhereInput } from '@prisma/client';
import { createPageEdges, paginationConnection } from '../../utils/paginator';
import { intArg, objectType, stringArg } from '@nexus/schema';
import { Post } from './Post';
import { getUserId } from '../../utils';

export const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.model.id();
    t.model.socialId();
    t.model.authType();
  },
});

interface pageEdgeType {
  cursor: string,
  node: typeof Post,
}
interface pageCursorType {
  cursor: string,
  page: number,
  isCurrent: boolean,
}
interface paginationConnectionType {
  pageEdges: [pageEdgeType],
  pageCursors: {
    previous: pageCursorType,
    first: pageCursorType,
    arounds: [pageCursorType],
    last: pageCursorType,
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
      resolve(_parent, {
        currentPage,
        cursor,
        size,
        buttonNum,
        orderBy,
        orderDirection,
        where,
      }, ctx):Promise<any> {
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

        const result = createPageEdges<FindManyPostArgs, PostDelegate, PostWhereInput>({
          modelType: 'post',
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
