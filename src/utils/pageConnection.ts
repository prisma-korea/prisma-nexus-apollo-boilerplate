import { Post, User } from '../types/models';
import { objectType } from '@nexus/schema';

const cursorConnection = objectType({
  name: 'cursorConnection',
  definition(t) {
    t.string('cursor');
    t.int('page');
    t.boolean('isCurrent');
  },
});
const pageCursorsConnection = objectType({
  name: 'pageCursorsConnection',
  definition(t) {
    t.field('previous', {
      type: cursorConnection,
      nullable: true,
    });
    t.field('first', {
      type: cursorConnection,
      nullable: true,
    });
    t.field('last', {
      type: cursorConnection,
      nullable: true,
    });
    t.list.field('around', {
      type: cursorConnection,
      nullable: true,
    });
  },
});

const pageEdgesConnection = objectType({
  name: 'pageEdgesConnection',
  definition(t) {
    t.string('cursor');
    t.field('post', {
      type: Post,
      nullable: true,
    });
    t.field('user', {
      type: User,
      nullable: true,
    });
  },
});

export const paginationConnection = objectType({
  name: 'paginationConnection',
  definition(t) {
    t.list.field('pageEdges', {
      type: pageEdgesConnection,
      nullable: true,
    });
    t.field('pageCursors', {
      type: pageCursorsConnection,
      nullable: true,
    });
  },
});
