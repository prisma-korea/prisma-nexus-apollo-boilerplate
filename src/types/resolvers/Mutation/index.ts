import { UserInputType, UserUpdateInputType, signIn, signUp, updateProfile } from './User';
import { createDraft, deletePost, publish } from './Post';

export const Mutation = [
  // inputTypes
  UserInputType,
  UserUpdateInputType,
  // mutations
  createDraft,
  deletePost,
  publish,
  signIn,
  signUp,
  updateProfile,
];
