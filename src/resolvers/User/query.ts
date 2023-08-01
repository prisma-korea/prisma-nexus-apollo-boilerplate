import {queryField} from 'nexus';

import {assert} from '../../utils/assert';

export const me = queryField('me', {
  type: 'User',

  resolve: (_, __, {prisma, userId}) => {
    assert(userId, 'Not authorized');

    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  },
});
