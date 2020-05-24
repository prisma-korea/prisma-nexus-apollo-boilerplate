import { asNexusMethod, enumType, scalarType } from '@nexus/schema';

import { GraphQLDate } from 'graphql-iso-date';
import { GraphQLUpload } from 'graphql-upload';

export const AuthType = enumType({
  name: 'AuthType',
  members: ['Email', 'Facebook', 'Google', 'Apple'],
});

export const Gender = enumType({
  name: 'Gender',
  members: ['Male', 'Female'],
});

enum GenderType {
  Male = 'Male',
  Female = 'Female',
}
export const GenderScalar = scalarType({
  name: 'GenderScalar',
  asNexusMethod: 'gender',
  parseValue(value: GenderType): GenderType {
    if (GenderType[value]) {
      return value;
    }
  },
  serialize(value) {
    return value;
  },
});

export const Upload = GraphQLUpload;
export const DateTime = GraphQLDate;
export const GQLDate = asNexusMethod(GraphQLDate, 'date');
