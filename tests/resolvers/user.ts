import {
  meQuery,
  signInMutation,
  signUpMutation,
  updateProfileMutation,
  userSignedInSubscription,
  userUpdatedSubscription,
} from './queries';

import {getTestUtils} from '../testUtils';
import {testHost} from '../testSetup';

const userVariables = {
  user: {
    name: 'dooboo1',
    email: 'dooboo@dooboolab.com',
    password: 'password',
    gender: 'male',
  },
};

export function user(): void {
  it('should signUp user', async () => {
    const {graphqlClient} = getTestUtils();
    const response = await graphqlClient.request(signUpMutation, userVariables);

    expect(response).toHaveProperty('signUp');
    expect(response.signUp).toHaveProperty('token');
    expect(response.signUp).toHaveProperty('user');
    expect(response.signUp.user.email).toEqual(userVariables.user.email);
  });

  it('should throw error when user does not exists', async () => {
    const {graphqlClient} = getTestUtils();

    const variables = {
      email: 'testtest@test.com',
      password: 'password',
    };

    const promise = graphqlClient.request(testHost, signInMutation, variables);

    expect(promise).rejects.toThrow();
  });

  it('should throw error when password is invalid', () => {
    const {graphqlClient} = getTestUtils();

    const variables = {
      email: 'dooboo@dooboolab.com',
      password: 'invalid',
    };

    const promise = graphqlClient.request(testHost, signInMutation, variables);

    expect(promise).rejects.toThrow();
  });

  it('should signIn user', async () => {
    const {graphqlClient, setAuthToken} = getTestUtils();

    const variables = {
      email: 'dooboo@dooboolab.com',
      password: 'password',
    };

    const response = await graphqlClient.request(signInMutation, variables);

    expect(response).toHaveProperty('signIn');
    expect(response.signIn).toHaveProperty('token');
    expect(response.signIn).toHaveProperty('user');
    expect(response.signIn.user.email).toEqual(variables.email);

    //! GQL client is replaced with authenticated one.
    setAuthToken(response.signIn.token);
  });

  describe('Resolver - after signIn', () => {
    const variables = {
      user: {
        name: 'HelloBro',
        gender: 'male',
      },
    };

    it('should update user profile', async () => {
      const {graphqlClient} = getTestUtils();

      const response = await graphqlClient.request(
        updateProfileMutation,
        variables,
      );

      expect(response).toHaveProperty('updateProfile');
      expect(response.updateProfile).toHaveProperty('name');
      expect(response.updateProfile).toHaveProperty('gender');
      expect(response.updateProfile.name).toEqual(variables.user.name);
      expect(response.updateProfile.gender).toEqual(variables.user.gender);
    });

    it('should throw error when invalid gender value is given', async () => {
      const {graphqlClient} = getTestUtils();

      const vars = {
        user: {
          name: 'HelloBro',
          gender: 'invalid',
        },
      };

      expect(async () => {
        await graphqlClient.request(updateProfileMutation, vars);
      }).rejects.toThrow();
    });

    it('should query me and get updated name', async () => {
      const {graphqlClient} = getTestUtils();
      const response = await graphqlClient.request(meQuery);

      expect(response).toHaveProperty('me');
      expect(response.me.name).toEqual(variables.user.name);
    });
  });

  describe('Resolver - user Subscription', () => {
    const userVariables = {
      user: {
        name: 'newUser1',
        email: 'newUser1@dooboolab.com',
        password: 'password123!',
        gender: 'male',
      },
    };

    it("should subscribe 'userSignedIn' after 'signUp' mutation", async () => {
      const {graphqlClient, apolloClient} = getTestUtils();

      let subscriptionValue;

      const response1 = await graphqlClient.request(
        signUpMutation,
        userVariables,
      );

      const userId = response1.signUp.user.id;

      expect(response1.signUp.user.name).toEqual(userVariables.user.name);
      expect(response1.signUp.user.gender).toEqual(userVariables.user.gender);

      apolloClient
        .subscribe({
          query: userSignedInSubscription,
          variables: {userId},
        })
        .subscribe({
          next: ({data}) => {
            return (subscriptionValue = data.userSignedIn);
          },
        });

      const variables = {
        email: 'newUser1@dooboolab.com',
        password: 'password123!',
      };

      const response2 = await graphqlClient.request(signInMutation, variables);

      expect(response2).toHaveProperty('signIn');
      expect(response2.signIn).toHaveProperty('token');
      expect(response2.signIn).toHaveProperty('user');
      expect(response2.signIn.user.id).toEqual(subscriptionValue.id);
      expect(response2.signIn.user.email).toEqual(subscriptionValue.email);
      expect(response2.signIn.user.name).toEqual(subscriptionValue.name);
      expect(response2.signIn.user.gender).toEqual(subscriptionValue.gender);

      expect(response2.signIn.user.createdAt).toEqual(
        subscriptionValue.createdAt,
      );
    });

    it("should subscribe 'userUpdated' after 'updateProfile' mutation", async () => {
      const {graphqlClient, apolloClient} = getTestUtils();

      let subscriptionValue;

      const variables = {
        email: 'newUser1@dooboolab.com',
        password: 'password123!',
      };

      const response = await graphqlClient.request(signInMutation, variables);

      expect(response.signIn).toHaveProperty('user');

      const userId = response.signIn.user.id;

      apolloClient
        .subscribe({
          query: userUpdatedSubscription,
          variables: {userId},
        })
        .subscribe({
          next: ({data}) => {
            return (subscriptionValue = data.userUpdated);
          },
        });

      const variables2 = {
        user: {
          name: 'HelloBro',
          gender: 'female',
        },
      };

      const response2 = await graphqlClient.request(
        updateProfileMutation,
        variables2,
      );

      expect(response2).toHaveProperty('updateProfile');
      expect(response2.updateProfile).toHaveProperty('name');
      expect(response2.updateProfile).toHaveProperty('gender');
    });
  });
}
