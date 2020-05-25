import { GraphQLClient, request } from 'graphql-request';
import {
  feedQuery,
  filterPostsQuery,
  meQuery,
  postQuery,
  signUpMutation,
} from './queries';

import { testHost } from './testSetup';

let client: GraphQLClient;

const userVariables = {
  user: {
    name: 'dooboo1',
    email: 'dooboo@dooboolab.com',
    password: 'password',
  },
};

describe('Resolver - Mutation', () => {
  it('should signUp user', async () => {
    const response = await request(testHost, signUpMutation, userVariables);

    expect(response).toHaveProperty('signUp');
    expect(response.signUp).toHaveProperty('token');
    expect(response.signUp).toHaveProperty('user');
    expect(response.signUp.user.email).toEqual(userVariables.user.email);

    // hyochan => Setup auth client for next test case
    client = new GraphQLClient(testHost, {
      headers: {
        authorization: response.signUp.token,
      },
    });
  });
});

describe('Resolver - Query', () => {
  it('should query me', async () => {
    const response = await client.request(meQuery);

    expect(response).toHaveProperty('me');
    expect(response.me.email).toEqual(userVariables.user.email);
  });

  it('should query feed', async () => {
    const response = await client.request(feedQuery);

    expect(response).toHaveProperty('feed');
    expect(response.feed).toHaveLength(0);
  });

  it('should query feed', async () => {
    const response = await client.request(feedQuery);

    expect(response).toHaveProperty('feed');
    expect(response.feed).toHaveLength(0);
  });

  it('should query post', async () => {
    const response = await client.request(postQuery, {
      id: 1,
    });

    expect(response).toHaveProperty('post');
  });

  it('should filter posts', async () => {
    const response = await client.request(filterPostsQuery, {
      searchString: 'title',
    });

    expect(response).toHaveProperty('filterPosts');
  });
});
