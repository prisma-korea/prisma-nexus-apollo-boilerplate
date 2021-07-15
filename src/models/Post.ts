import {objectType} from 'nexus';

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.int('id');
    t.string('title');
    t.string('content');
    t.boolean('published');

    t.date('createdAt');
    t.date('updatedAt');
    t.date('deletedAt');
  },
});
