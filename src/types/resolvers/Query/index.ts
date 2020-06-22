import { feed, filterPosts, post } from './Post';
import { me } from './User';

export const Query = [
  me,
  feed,
  filterPosts,
  post,
];
