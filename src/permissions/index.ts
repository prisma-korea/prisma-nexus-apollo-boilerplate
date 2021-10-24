import {rule, shield} from 'graphql-shield';

const rules = {
  isAuthenticatedUser: rule()((_, __, {userId}) => {
    return Boolean(userId);
  }),
  isPostOwner: rule()(async (_, {id}, {prisma, userId}) => {
    const author = await prisma.post
      .findUnique({
        where: {id: Number(id)},
      })
      .user();

    return userId === author.id;
  }),
};

export const permissions = shield(
  {
    Query: {
      me: rules.isAuthenticatedUser,
      filterPosts: rules.isAuthenticatedUser,
      post: rules.isAuthenticatedUser,
    },
    Mutation: {
      createDraft: rules.isAuthenticatedUser,
      deletePost: rules.isPostOwner,
      publish: rules.isPostOwner,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV !== 'production',
  },
);
