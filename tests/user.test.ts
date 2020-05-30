import { GraphQLClient, request } from 'graphql-request';
import {
  meQuery,
  signInMutation,
  signUpMutation,
  updateProfileMutation,
  userUpdatedSubscription,
} from './setup/queries';
import { pubSub, testHost } from './setup/testSetup';

let client: GraphQLClient;

const userVariables = {
  user: {
    name: 'dooboo1',
    email: 'dooboo@dooboolab.com',
    password: 'password',
    gender: 'Male',
  },
};

const userVariables2 = {
  user: {
    name: 'clark',
    email: 'clark@dooboolab.com',
    password: 'password',
    gender: 'Male',
  },
};

describe('Resolver - User', () => {
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
    const variables = {
      user: {
        name: 'HelloBro',
        gender: 'Male',
      },
    };

    it('should update user profile', async () => {
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

    it('should query me and get updated name', async () => {
      const response = await client.request(meQuery);

      expect(response).toHaveProperty('me');
      expect(response.me.name).toEqual(variables.user.name);
    });
  });

  describe('Resolver - user Subscription', () => {
    it('should subscribe userUpdated after updateProfileMutation', async () => {
      let subscriptionValue;
      const variables = {
        user: {
          name: 'HelloBro',
          gender: 'Female',
        },
      };

      const response = await request(testHost, signUpMutation, userVariables2);
      const userId = response.signUp.user.id;
      expect(response.signUp.user.name).toEqual(userVariables2.user.name);
      expect(response.signUp.user.gender).toEqual(userVariables2.user.gender);

      pubSub.subscribe({
        query: userUpdatedSubscription,
        variables: { userId: userId },
      }).subscribe({
        next: ({ data }) => {
          return (subscriptionValue = data.userUpdated);
        },
      });

      client = new GraphQLClient(testHost, {
        headers: {
          authorization: response.signUp.token,
        },
      });
      const response2 = await client.request(updateProfileMutation, variables);

      expect(response2).toHaveProperty('updateProfile');
      expect(response2.updateProfile).toHaveProperty('name');
      expect(response2.updateProfile).toHaveProperty('gender');
      expect(response2.updateProfile.name).toEqual(subscriptionValue.name);
      expect(response2.updateProfile.gender).toEqual(subscriptionValue.gender);
    });
  });
});
