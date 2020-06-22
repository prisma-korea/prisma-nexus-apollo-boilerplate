import { userSignedIn, userUpdated } from './User';
export { USER_SIGNED_IN, USER_UPDATED } from './User';

export const Subscription = [
  userSignedIn,
  userUpdated,
];
