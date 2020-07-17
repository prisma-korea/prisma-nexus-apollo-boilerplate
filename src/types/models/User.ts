import { PaginationType, prismaOffsetPagination } from '../../utils/paginator';
import { intArg, objectType, stringArg } from '@nexus/schema';
import { Post } from './Post';
import { PostWhereInput } from '@prisma/client';
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
        whereArgs: stringArg(),
      },
      async resolve(_parent, {
        currentPage,
        cursor,
        size,
        buttonNum,
        orderBy,
        orderDirection,
        whereArgs,
      }, ctx):Promise<PaginationType> {
        const userId = getUserId(ctx);

        let whereArgsExtra: PostWhereInput = {
          user: {
            id: userId,
          },
        };
        if (whereArgs) {
          const whereArgsParsed = JSON.parse(whereArgs.replace(/'/g, '"'));
          whereArgsExtra = { ...whereArgsExtra, ...whereArgsParsed };
        }

        const result = await prismaOffsetPagination({
          model: Post,
          currentPage,
          cursor,
          size,
          buttonNum,
          orderBy,
          // @ts-ignore -> TODO : Change orderDirection as unionType
          orderDirection,
          whereArgs: whereArgsExtra,
          IsWhereArgsString: false,
          prisma: ctx.prisma,
        });
        return result;
      },
    });
  },
});
