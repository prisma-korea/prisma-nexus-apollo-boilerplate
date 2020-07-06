import { User } from '../../types/models';
import { objectType } from '@nexus/schema';

const pageEdgesUserConnection = objectType({
  name: 'pageEdgesUserConnection',
  definition(t) {
    t.string('cursor');
    t.field('node', {
      type: User,
      nullable: true,
    });
  },
});

const cursorUserConnection = objectType({
  name: 'cursorUserConnection',
  definition(t) {
    t.string('cursor');
    t.int('page');
    t.boolean('isCurrent');
  },
});
const pageCursorsUserConnection = objectType({
  name: 'pageCursorsUserConnection',
  definition(t) {
    t.field('previous', {
      type: cursorUserConnection,
      nullable: true,
    });
    t.field('first', {
      type: cursorUserConnection,
      nullable: true,
    });
    t.field('last', {
      type: cursorUserConnection,
      nullable: true,
    });
    t.list.field('around', {
      type: cursorUserConnection,
      nullable: true,
    });
  },
});

export const paginationUserConnection = objectType({
  name: 'paginationUserConnection',
  definition(t) {
    t.list.field('pageEdges', {
      type: pageEdgesUserConnection,
      nullable: true,
    });
    t.field('pageCursors', {
      type: pageCursorsUserConnection,
      nullable: true,
    });
  },
});
