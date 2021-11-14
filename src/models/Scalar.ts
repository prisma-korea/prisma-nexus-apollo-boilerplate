import {asNexusMethod, enumType, scalarType} from 'nexus';

import {GraphQLDateTime} from 'graphql-iso-date';
import {GraphQLUpload} from 'graphql-upload';

export const AuthType = enumType({
  name: 'AuthType',
  members: ['Email', 'Facebook', 'Google', 'Apple'],
});

enum GenderType {
  male = 'male',
  female = 'female',
}

export const Gender = scalarType({
  name: 'Gender',
  asNexusMethod: 'gender',
  parseValue(value: GenderType): GenderType | undefined {
    if (GenderType[value]) {
      return value;
    }
  },
  serialize(value) {
    return value;
  },
});

export const Upload = GraphQLUpload;
export const DateTime = asNexusMethod(GraphQLDateTime, 'date');
