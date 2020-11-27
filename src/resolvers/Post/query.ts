import { intArg, list, queryField, stringArg } from '@nexus/schema';

export const feed = queryField('feed', {
  type: list('Post'),

  resolve: (parent, args, ctx) => {
    return ctx.prisma.post.findMany({
      where: { published: true },
    });
  },
});

export const filterPosts = queryField('filterPosts', {
  type: list('Post'),
  args: { searchString: stringArg() },

  resolve: (parent, { searchString }, ctx) => {
    return ctx.prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchString,
            },
          },
          {
            content: {
              contains: searchString,
            },
          },
        ],
      },
    });
  },
});

export const post = queryField('post', {
  type: 'Post',
  args: { id: intArg() },

  resolve: (parent, { id }, ctx) => {
    return ctx.prisma.post.findOne({
      where: {
        id: Number(id),
      },
    });
  },
});
