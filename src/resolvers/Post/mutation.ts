import {intArg, mutationField, nonNull, stringArg} from 'nexus';

import {assert} from '../../utils/assert';

export const createDraft = mutationField('createDraft', {
  type: 'Post',
  args: {
    title: nonNull(stringArg()),
    content: stringArg(),
  },
  resolve: (parent, {title, content}, {prisma, userId}) => {
    assert(userId, 'Not authorized');

    return prisma.post.create({
      data: {
        title,
        content,
        published: false,
        user: {connect: {id: userId}},
      },
    });
  },
});

export const deletePost = mutationField('deletePost', {
  type: 'Post',
  args: {id: nonNull(intArg())},

  resolve: (parent, {id}, {prisma}) => {
    return prisma.post.delete({
      where: {
        id,
      },
    });
  },
});

export const publish = mutationField('publish', {
  type: 'Post',
  args: {id: intArg()},

  resolve: (__, {id}, {prisma}) => {
    return prisma.post.update({
      where: {id: id ?? undefined},
      data: {published: true},
    });
  },
});
