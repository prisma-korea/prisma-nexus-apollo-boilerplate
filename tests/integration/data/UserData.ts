import { NexusGenRootTypes } from '../../../src/generated/nexus';
import casual from 'casual';

export function user(): NexusGenRootTypes['User'] {
  return {
    id: 'cuid1',
    email: 'tester@dooboolab.com',
    name: 'tester',
    thumbURL: '',
    photoURL: '',
    nickname: '',
    phone: '',
    gender: 'Gender',
    verified: false,
    createdAt: casual.date,
    updatedAt: casual.date,
    deletedAt: casual.date,
  };
}

export function authPayload(): NexusGenRootTypes['AuthPayload'] {
  return {
    token: 'testToken!',
    user: {
      id: 'cuid1',
      email: 'test@dooboolab.com',
      name: 'test',
      thumbURL: '',
      photoURL: '',
      nickname: '',
      phone: '',
      gender: 'Gender',
      verified: false,
      createdAt: casual.date,
      updatedAt: casual.date,
      deletedAt: casual.date,
    },
  };
}
