import { Post } from '../../types/models';
import { objectType } from '@nexus/schema';

const pageEdgesPostConnection = objectType({
  name: 'pageEdgesPostConnection',
  definition(t) {
    t.string('cursor');
    t.field('node', {
      type: Post,
      nullable: true,
    });
  },
});

const cursorPostConnection = objectType({
  name: 'cursorPostConnection',
  definition(t) {
    t.string('cursor');
    t.int('page');
    t.boolean('isCurrent');
  },
});
const pageCursorsPostConnection = objectType({
  name: 'pageCursorsPostConnection',
  definition(t) {
    t.field('previous', {
      type: cursorPostConnection,
      nullable: true,
    });
    t.field('first', {
      type: cursorPostConnection,
      nullable: true,
    });
    t.field('last', {
      type: cursorPostConnection,
      nullable: true,
    });
    t.list.field('around', {
      type: cursorPostConnection,
      nullable: true,
    });
  },
});

export const paginationPostConnection = objectType({
  name: 'paginationPostConnection',
  definition(t) {
    t.list.field('pageEdges', {
      type: pageEdgesPostConnection,
      nullable: true,
    });
    t.field('pageCursors', {
      type: pageCursorsPostConnection,
      nullable: true,
    });
  },
});
