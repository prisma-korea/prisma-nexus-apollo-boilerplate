import {list, objectType} from 'nexus';

export const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.id('id');
    t.string('socialId');

    t.field('authType', {
      type: 'AuthType',
    });
  },
});

export const User = objectType({
  name: 'User',
  definition(t) {
    t.id('id');
    t.string('email');
    t.string('name');
    t.string('nickname');
    t.string('thumbURL');
    t.string('photoURL');
    t.date('birthDay');
    t.gender('gender');
    t.string('phone');
    t.date('createdAt');
    t.date('updatedAt');
    t.date('deletedAt');

    t.field('profile', {type: 'Profile'});
    t.field('posts', {type: list('Post')});
  },
});
