import {post} from './resolvers/post';
import {user} from './resolvers/user';

describe('main tests', () => {
  user();
  post();
});
