import { NexusGenArgTypes, NexusGenInputs, NexusGenRootTypes } from '../../../src/generated/nexus';

import { Context } from '../apis/types';
import { IResolvers } from 'apollo-server';

export const userResolvers: IResolvers = {
  Query: {
    me: (
      _: 'User',
      __: void,
      { dataSources }: Context,
    ): Promise<NexusGenRootTypes['User']> =>
      dataSources.userAPI.me(),
  },
  Mutation: {
    signUp: (
      _: 'User',
      signUpUser: NexusGenInputs['UserCreateInput'],
      { dataSources }: Context,
    ): Promise<NexusGenRootTypes['User']> => {
      const user = dataSources.userAPI.signUp(
        signUpUser,
      );

      return user;
    },
    signIn: (
      _: 'AuthPayload',
      args: NexusGenArgTypes['Mutation']['signIn'],
      { dataSources }: Context,
    ): Promise<NexusGenRootTypes['AuthPayload']> => {
      const signInUser = dataSources.userAPI.signIn(
        args,
      );

      return signInUser;
    },

  },
};
