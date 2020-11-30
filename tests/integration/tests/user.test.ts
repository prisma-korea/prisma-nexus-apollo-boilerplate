import { authPayload, user } from '../data';

import { NexusGenRootTypes } from '../../../src/generated/nexus';
import UserAPI from '../apis/UserAPI';
/* eslint-disable @typescript-eslint/no-explicit-any */
import gql from 'graphql-tag';
import testServer from '../testServer';
import { userResolvers } from '../resolvers';

describe('user resolvers', () => {
  it('me query', async () => {
    const userAPI: any = new UserAPI();

    const setUser = (): Promise<NexusGenRootTypes['User']> =>
      Promise.resolve(user());

    userAPI.get = jest.fn(setUser);

    const { query } = testServer(() => ({ userAPI }), userResolvers);

    const meQuery = gql`
      query me {
        me {
          id
          email
        }
      }
    `;

    const res = await query({ query: meQuery });

    expect(res.errors).toBe(undefined);
    expect(res.data).toHaveProperty('me');
    expect(res.data.me.id).toEqual('cuid1');
  });

  it('user query', async () => {
    const userAPI: any = new UserAPI();

    const setUser = (): Promise<NexusGenRootTypes['User']> =>
      Promise.resolve(user());

    userAPI.get = jest.fn(setUser);

    const { query } = testServer(() => ({ userAPI }), userResolvers);

    const USER = gql`
      query user($id: String!) {
        user(id: $id){
          id
          name
          email
        }
      }
    `;

    const userId = {
      id: 'cuid1',
    };

    const res = await query({
      query: USER,
      variables: userId,
    });

    expect(res.errors).toBe(undefined);
    expect(res.data).toHaveProperty('user');
    expect(res.data.user.name).toEqual('tester');
  });

  it('signUp mutation', async () => {
    const userAPI: any = new UserAPI();

    const newUser = {
      email: 'jessie@dooboolab.com',
      password: 'jessie123!',
      name: 'jessie',
    };

    const updatedUser = {
      ...user(),
      id: '3',
      ...newUser,
    };

    userAPI.post = jest.fn(() =>
      Promise.resolve(updatedUser),
    );

    const { mutate } = testServer(() => ({ userAPI }), userResolvers);

    const SIGN_UP = gql`
      mutation signUp($user: UserCreateInput) {
        signUp(user: $user) {
          id
          name
        }
      }
    `;

    const res = await mutate({
      mutation: SIGN_UP,
      variables: { newUser },
    });

    expect(res.errors).toBe(undefined);
    expect(res.data.signUp).toHaveProperty('name');
    expect(res.data.signUp.name).toEqual('jessie');
  });

  it('signIn mutation', async () => {
    const userAPI: any = new UserAPI();

    const setAuthPayload = (): Promise<NexusGenRootTypes['AuthPayload']> =>
      Promise.resolve(authPayload());

    userAPI.post = jest.fn(setAuthPayload);

    const { mutate } = testServer(() => ({ userAPI }), userResolvers);

    const signInUser = {
      email: 'test@dooboolab.com',
      password: 'test123!',
    };

    const SIGN_IN_EMAIL = gql`
      mutation signIn($email: String! $password: String!) {
        signIn(email: $email, password: $password) {
          token
          user {
            id
            name
            email
          }
        }
      }
    `;

    const res = await mutate({
      mutation: SIGN_IN_EMAIL,
      variables: signInUser,
    });

    expect(res.errors).toBe(undefined);
    expect(res.data.signIn).toHaveProperty('token');
    expect(res.data.signIn.user.name).toEqual('test');
  });
});
