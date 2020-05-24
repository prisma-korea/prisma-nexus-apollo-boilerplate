import { GraphQLClient, request } from 'graphql-request';
import {
  createDraftMutation,
  deletePostMutation,
  feedQuery,
  filterPostsQuery,
  meQuery,
  postQuery,
  publishMutation,
  signInMutation,
  signUpMutation,
  updateProfileMutation,
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
  });

  it('should throw error when user does not exists', async () => {
    const variables = {
      email: 'testtest@test.com',
      password: 'password',
    };

    const promise = request(testHost, signInMutation, variables);
    expect(promise).rejects.toThrow();
  });

  it('should throw error when password is invalid', () => {
    const variables = {
      email: 'dooboo@dooboolab.com',
      password: 'invalid',
    };

    const promise = request(testHost, signInMutation, variables);
    expect(promise).rejects.toThrow();
  });

  it('should signIn user', async () => {
    const variables = {
      email: 'dooboo@dooboolab.com',
      password: 'password',
    };

    const response = await request(testHost, signInMutation, variables);
    expect(response).toHaveProperty('signIn');
    expect(response.signIn).toHaveProperty('token');
    expect(response.signIn).toHaveProperty('user');
    expect(response.signIn.user.email).toEqual(variables.email);

    // hyochan => Setup auth client for next test case
    client = new GraphQLClient(testHost, {
      headers: {
        authorization: response.signIn.token,
      },
    });
  });

  describe('Resolver - after signIn', () => {
    it('should update user profile', async () => {
      const variables = {
        user: {
          name: 'HelloBro',
          gender: 'Female',
        },
      };

      const response = await client.request(updateProfileMutation, variables);
      expect(response).toHaveProperty('updateProfile');
      expect(response.updateProfile).toHaveProperty('name');
      expect(response.updateProfile).toHaveProperty('gender');
      expect(response.updateProfile.name).toEqual(variables.user.name);
      expect(response.updateProfile.gender).toEqual(variables.user.gender);
    });

    it('should throw error when invalid gender value is given', async () => {
      const variables = {
        user: {
          name: 'HelloBro',
          gender: 'Woman',
        },
      };

      expect(async () => {
        await client.request(updateProfileMutation, variables);
      }).rejects.toThrow();
    });

    it('should create auth user`s draft', async () => {
      const variables = {
        title: 'title',
        content: 'content',
      };

      const response = await client.request(createDraftMutation, variables);
      expect(response).toHaveProperty('createDraft');
      expect(response.createDraft).toHaveProperty('id');
      expect(response.createDraft.title).toEqual('title');
    });

    it('should publish user`s draft', async () => {
      const variables = {
        id: 1,
      };

      const response = await client.request(publishMutation, variables);
      expect(response).toHaveProperty('publish');
      expect(response.publish).toHaveProperty('id');
      expect(response.publish.title).toEqual('title');
    });

    it('should delete user`s draft', async () => {
      const variables = {
        id: 1,
      };

      const response = await client.request(deletePostMutation, variables);
      expect(response).toHaveProperty('deletePost');
      expect(response.deletePost).toHaveProperty('id');
      expect(response.deletePost.id).toEqual(1);
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
